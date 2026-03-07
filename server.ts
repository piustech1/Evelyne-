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

  // Helper function to process successful payments (used by webhook and worker)
  async function processSuccessfulPayment(reference: string, rawAmount: number, providerInfo?: string, verifiedBy: string = 'webhook') {
    try {
      const paymentRef = ref(db, `payments/${reference}`);
      const snapshot = await get(paymentRef);
      const paymentData = snapshot.val();

      if (paymentData && (paymentData.status === 'pending' || paymentData.status === 'Pending')) {
        let userId = paymentData.userId;

        // Fallback: If userId is missing, lookup by email
        if (!userId && paymentData.userEmail) {
          console.log(`[${verifiedBy.toUpperCase()}] UserId missing, falling back to email lookup: ${paymentData.userEmail}`);
          const usersRef = ref(db, 'users');
          const userQuery = query(usersRef, orderByChild('email'), equalTo(paymentData.userEmail));
          const userSnapshot = await get(userQuery);
          const usersData = userSnapshot.val();
          if (usersData) {
            userId = Object.keys(usersData)[0];
          }
        }

        if (userId) {
          console.log(`[${verifiedBy.toUpperCase()}] Crediting User ${userId}: UGX ${rawAmount} (Ref: ${reference})`);
          
          // 1. Atomic Balance Update
          const userRef = ref(db, `users/${userId}`);
          await update(userRef, {
            balance: increment(Number(rawAmount))
          });

          // 2. Update Payment Record
          await update(paymentRef, {
            status: 'Successful',
            phone: paymentData.phone || '',
            provider: providerInfo || paymentData.provider || 'MarzPay',
            verifiedBy,
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });

          // 3. Add Notification
          const notificationRef = push(ref(db, `notifications/${userId}`));
          await set(notificationRef, {
            message: `Deposit successful! UGX ${Number(rawAmount).toLocaleString()} has been credited to your wallet.`,
            type: 'deposit',
            timestamp: new Date().toISOString(),
            read: false
          });

          console.log(`[${verifiedBy.toUpperCase()}] SUCCESS: Wallet updated for User ${userId}`);
          return true;
        } else {
          console.error(`[${verifiedBy.toUpperCase()}] FAILED: No userId found for payment ${reference}`);
        }
      }
      return false;
    } catch (error) {
      console.error(`[${verifiedBy.toUpperCase()}] Error processing payment ${reference}:`, error);
      return false;
    }
  }

  // Background Verification Worker
  function startPaymentVerificationWorker() {
    console.log('Payment Verification Worker started (Polling every 20s)');
    setInterval(async () => {
      try {
        const paymentsRef = ref(db, 'payments');
        // Fetch all payments and filter client-side to avoid "Index not defined" error
        const snapshot = await get(paymentsRef);
        const allPayments = snapshot.val();

        if (!allPayments) return;

        const auth = Buffer.from(`${MARZPAY_API_KEY}:${MARZPAY_API_SECRET}`).toString('base64');

        for (const reference of Object.keys(allPayments)) {
          const payment = allPayments[reference];
          
          // Only process 'pending' payments
          if (payment.status !== 'pending' && payment.status !== 'Pending') continue;
          
          // Wait at least 30 seconds after creation before polling to give webhook a chance
          const createdAt = new Date(payment.createdAt).getTime();
          if (Date.now() - createdAt < 30000) continue;

          try {
            const response = await fetch(`https://wallet.wearemarz.com/api/v1/transaction-status/${reference}`, {
              headers: {
                'Authorization': `Basic ${auth}`,
                'Accept': 'application/json'
              }
            });

            if (response.ok) {
              const data = await response.json();
              if (data?.status === 'completed') {
                const amount = typeof data.amount === 'object' ? data.amount?.raw : (data.amount || payment.amount);
                await processSuccessfulPayment(reference, amount, data.provider, 'system-check');
              }
            }
          } catch (err) {
            // Silently fail for individual checks to not break the loop
          }
        }
      } catch (error) {
        console.error('Verification Worker Error:', error);
      }
    }, 20000);
  }

  // Start the worker
  startPaymentVerificationWorker();

  app.post('/api/create-payment', async (req, res) => {
    try {
      console.log("Payment request received");
      const { userId, username, userEmail, phoneNumber, amount, provider } = req.body;
      
      if (!userId || !phoneNumber || !amount) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
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
        provider: provider || 'MarzPay',
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      console.log("Calling MarzPay API");
      const auth = Buffer.from(`${MARZPAY_API_KEY}:${MARZPAY_API_SECRET}`).toString('base64');
      
      // Use the production URL for the callback
      const callbackUrl = "https://easyboost.vercel.app/api/marz-webhook";

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
          description: "Wallet Top-up",
          callback_url: callbackUrl
        })
      });

      if (!marzResponse.ok) {
        const errorData = await marzResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'MarzPay initiation failed');
      }

      return res.json({ 
        success: true, 
        reference: reference,
        message: 'Payment initiated' 
      });
    } catch (error: any) {
      console.error('Create Payment Error:', error);
      return res.status(500).json({ 
        success: false, 
        message: error.message || "Payment initiation failed"
      });
    }
  });

  app.post('/api/marz-webhook', async (req, res) => {
    try {
      const payload = req.body;
      console.log('Webhook received', JSON.stringify(payload, null, 2));

      // Extract transaction data - handle both direct and nested structures
      const transaction = payload?.data?.transaction || payload?.transaction;
      
      if (!transaction) {
        console.log('No transaction data in webhook');
        return res.status(200).json({ received: true, message: "No transaction data" });
      }

      const { status, reference, amount, provider } = transaction;
      const rawAmount = typeof amount === 'object' ? amount?.raw : amount;

      // Only process if event_type is collection.completed and status is completed
      if (payload.event_type === 'collection.completed' && status === 'completed') {
        const success = await processSuccessfulPayment(reference, rawAmount, provider, 'webhook');
        if (success) {
          console.log("Wallet credited", reference);
        }
      }
      
      return res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook processing failed:', error);
      return res.status(200).json({ received: true, error: "Internal processing error" });
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