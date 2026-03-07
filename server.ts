import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import crypto from 'crypto';
import { db } from './src/lib/firebase';
import { ref, get, set, push, increment, update, query, orderByChild, equalTo } from 'firebase/database';

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
      const response = await fetch(SMM_API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0'
        },
        body: `key=${API_KEY}&action=services`
      });
      const services = await response.json();
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/smm/order', async (req, res) => {
    try {
      const { service, link, quantity } = req.body;
      const response = await fetch(SMM_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `key=${API_KEY}&action=add&service=${encodeURIComponent(service)}&link=${encodeURIComponent(link)}&quantity=${encodeURIComponent(quantity)}`
      });
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // MarzPay Integration
  const MARZPAY_API_KEY = process.env.MARZPAY_API_KEY;
  const MARZPAY_API_SECRET = process.env.MARZPAY_API_SECRET;

  const normalizePhoneNumber = (phone: string): string => {
    let normalized = phone.trim();
    if (normalized.startsWith('0')) normalized = '+256' + normalized.substring(1);
    else if (normalized.startsWith('256')) normalized = '+' + normalized;
    return normalized;
  };

  app.post('/api/create-payment', async (req, res) => {
    try {
      const { userId, username, userEmail, phoneNumber, amount, provider } = req.body;
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      const reference = crypto.randomUUID();

      // IMPORTANT: Store the userId directly in the payment record
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

      const auth = Buffer.from(`${MARZPAY_API_KEY}:${MARZPAY_API_SECRET}`).toString('base64');
      const callbackUrl = process.env.APP_URL 
        ? `${process.env.APP_URL}/api/marz-webhook`
        : `${req.protocol}://${req.get('host')}/api/marz-webhook`;

      const marzResponse = await fetch('https://wallet.wearemarz.com/api/v1/collect-money', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          amount: Math.floor(Number(amount)),
          phone_number: normalizedPhone,
          country: 'UG',
          reference: reference,
          callback_url: callbackUrl
        })
      });

      res.json({ success: true, reference });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/marz-webhook', async (req, res) => {
    try {
      const data = req.body;
      console.log('Webhook Data Received:', JSON.stringify(data, null, 2));

      if (!data?.transaction) {
        console.log('No transaction data in webhook');
        return res.status(200).send('OK');
      }

      const { status, reference, amount, phone_number, provider } = data.transaction;
      // Handle both object and number formats for amount
      const rawAmount = typeof amount === 'object' ? amount?.raw : amount;

      console.log(`Processing Webhook: Ref=${reference}, Status=${status}, Event=${data.event_type}, Amount=${rawAmount}`);

      // Only proceed if MarzPay says 'completed'
      if (data.event_type === 'collection.completed' && status === 'completed') {
        
        // 1. Find the payment record directly by its UUID key
        const paymentRef = ref(db, `payments/${reference}`);
        const snapshot = await get(paymentRef);
        const paymentData = snapshot.val();

        if (paymentData && (paymentData.status === 'pending' || paymentData.status === 'Pending')) {
          let userId = paymentData.userId;

          // Fallback: If userId is missing, lookup by email
          if (!userId && paymentData.userEmail) {
            console.log(`UserId missing in payment record, falling back to email lookup for: ${paymentData.userEmail}`);
            const usersRef = ref(db, 'users');
            const userQuery = query(usersRef, orderByChild('email'), equalTo(paymentData.userEmail));
            const userSnapshot = await get(userQuery);
            const usersData = userSnapshot.val();
            if (usersData) {
              userId = Object.keys(usersData)[0];
              console.log(`Found userId via fallback: ${userId}`);
            }
          }

          if (userId) {
            console.log(`Updating balance for User: ${userId}, Amount: ${rawAmount}`);
            
            // 2. DIRECT BALANCE UPDATE: Use atomic increment
            const userRef = ref(db, `users/${userId}`);
            await update(userRef, {
              balance: increment(Number(rawAmount))
            });

            // 3. UPDATE PAYMENT: Mark as Successful and save phone/method
            await update(paymentRef, {
              status: 'Successful',
              phone: phone_number || paymentData.phone || '',
              provider: provider || paymentData.provider || '',
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });

            // 4. ADD NOTIFICATION
            const notificationRef = push(ref(db, `notifications/${userId}`));
            await set(notificationRef, {
              message: `Deposit successful! UGX ${Number(rawAmount).toLocaleString()} has been credited to your wallet.`,
              type: 'deposit',
              timestamp: new Date().toISOString(),
              read: false
            });

            console.log(`SUCCESS: Wallet updated for User ${userId}`);
          } else {
            console.error(`FAILED: No userId found for payment reference ${reference}`);
          }
        } else {
          console.log(`Payment ${reference} already processed or not found. Status: ${paymentData?.status}`);
        }
      }
      res.status(200).send('OK');
    } catch (error) {
      console.error('Webhook processing failed:', error);
      res.status(200).send('OK');
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => res.sendFile('dist/index.html', { root: '.' }));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server live on http://localhost:${PORT}`);
  });
}

startServer();