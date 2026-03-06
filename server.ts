import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import crypto from 'crypto';
import { db } from './src/lib/firebase';
import { ref, get, set, runTransaction, push } from 'firebase/database';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // SMM API Proxy Routes
  const SMM_API_URL = 'https://smmtrustpanel.com/api/v2';
  const API_KEY = '83d97dd9b3b61589318f4f50b1b90d1a';

  app.post('/api/smm/services', async (req, res) => {
    try {
      if (!API_KEY) throw new Error('SMM_API_KEY is not configured');

      const response = await fetch(SMM_API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0'
        },
        body: `key=${API_KEY}&action=services`
      });

      console.log("API STATUS:", response.status);
      const text = await response.text();
      console.log("RAW RESPONSE:", text);

      if (!text.startsWith("[") && !text.startsWith("{")) {
        throw new Error("Invalid API response");
      }

      const services = JSON.parse(text);
      console.log("SERVICES:", services);
      
      res.json(services);
    } catch (error: any) {
      console.error('SMM Services Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/smm/order', async (req, res) => {
    try {
      if (!API_KEY) throw new Error('SMM_API_KEY is not configured');
      const { service, link, quantity } = req.body;

      const response = await fetch(SMM_API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0'
        },
        body: `key=${API_KEY}&action=add&service=${encodeURIComponent(service)}&link=${encodeURIComponent(link)}&quantity=${encodeURIComponent(quantity)}`
      });

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('SMM Order Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/smm/status', async (req, res) => {
    try {
      if (!API_KEY) throw new Error('SMM_API_KEY is not configured');
      const { orderId } = req.body;

      const response = await fetch(SMM_API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0'
        },
        body: `key=${API_KEY}&action=status&order=${encodeURIComponent(orderId)}`
      });

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('SMM Status Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // MarzPay Integration
  const MARZPAY_BASE_URL = 'https://wallet.wearemarz.com/api/v1';
  const MARZPAY_API_KEY = process.env.MARZPAY_API_KEY;
  const MARZPAY_API_SECRET = process.env.MARZPAY_API_SECRET;

  const normalizePhoneNumber = (phone: string): string => {
    let normalized = phone.trim();
    if (normalized.startsWith('0')) {
      normalized = '+256' + normalized.substring(1);
    } else if (normalized.startsWith('256')) {
      normalized = '+' + normalized;
    }
    
    const ugandaRegex = /^\+256\d{9}$/;
    if (!ugandaRegex.test(normalized)) {
      throw new Error('Invalid Uganda phone number format. Use 07XXXXXXXX or +2567XXXXXXXX');
    }
    return normalized;
  };

  app.post('/api/create-payment', async (req, res) => {
    try {
      const { userId, username, userEmail, phoneNumber, amount, provider } = req.body;
      
      if (!userId || !phoneNumber || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      const reference = crypto.randomUUID();

      // Store pending payment in Firebase
      const paymentRef = ref(db, `payments/${reference}`);
      await set(paymentRef, {
        reference,
        userId,
        username: username || 'User',
        userEmail: userEmail || '',
        phone: normalizedPhone,
        amount: Number(amount),
        provider,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      // Call MarzPay API
      const auth = Buffer.from(`${MARZPAY_API_KEY}:${MARZPAY_API_SECRET}`).toString('base64');
      
      const marzResponse = await fetch(`${MARZPAY_BASE_URL}/collect-money`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: Number(amount),
          phone_number: normalizedPhone,
          country: 'UG',
          reference: reference,
          description: 'Wallet top-up',
          callback_url: `${req.protocol}://${req.get('host')}/api/marz-webhook`
        })
      });

      const marzData = await marzResponse.json();
      console.log('MarzPay Response:', marzData);

      if (!marzResponse.ok) {
        throw new Error(marzData.message || 'Failed to initiate payment with MarzPay');
      }

      res.json({ success: true, reference });
    } catch (error: any) {
      console.error('Create Payment Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/marz-webhook', async (req, res) => {
    try {
      const { event_type, transaction } = req.body;
      console.log('Webhook Received:', req.body);

      if (event_type === 'collection.completed' && transaction.status === 'completed') {
        const reference = transaction.reference;
        const amount = transaction.amount.raw;

        // Find payment in Firebase
        const paymentRef = ref(db, `payments/${reference}`);
        const snapshot = await get(paymentRef);
        const paymentData = snapshot.val();

        if (paymentData && paymentData.status === 'pending') {
          // Update payment status
          await set(paymentRef, {
            ...paymentData,
            status: 'completed',
            updatedAt: new Date().toISOString()
          });

          // Update user balance
          const userRef = ref(db, `users/${paymentData.userId}`);
          await runTransaction(userRef, (currentData) => {
            if (currentData) {
              currentData.balance = (currentData.balance || 0) + Number(amount);
            }
            return currentData;
          });

          // Add notification
          const notificationRef = push(ref(db, `notifications/${paymentData.userId}`));
          await set(notificationRef, {
            message: `Deposit successful! Your balance has been updated by UGX ${Number(amount).toLocaleString()}.`,
            type: 'deposit',
            timestamp: new Date().toISOString(),
            read: false
          });

          console.log(`Wallet updated for user ${paymentData.userId}: +${amount}`);
        }
      }

      res.json({ status: 'received' });
    } catch (error) {
      console.error('Webhook Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
