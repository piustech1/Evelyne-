import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import admin from 'firebase-admin';

dotenv.config();

// Initialize Firebase Admin
let firebaseInitError: string | null = null;

async function initializeFirebase() {
  console.log("Checking for FIREBASE_SERVICE_ACCOUNT...");
  let envValue = process.env.FIREBASE_SERVICE_ACCOUNT;
  const FIREBASE_GAS_URL = 'https://script.google.com/macros/s/AKfycbxJvP6p9rrpr6CtV9zhwsiAr5CJ5GwTlklxIdf9_1hjEFNcwfreb9-T24EfWwSMWNedDg/exec';

  // If environment variable is missing, fetch it from the hardcoded GAS URL
  if (!envValue) {
    try {
      console.log("Fetching Firebase Service Account from hardcoded GAS URL...");
      const response = await fetch(FIREBASE_GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        envValue = await response.text();
        // Update process.env so other parts of the app can see it
        process.env.FIREBASE_SERVICE_ACCOUNT = envValue;
        console.log("Successfully fetched Firebase Service Account from GAS URL");
      } else {
        throw new Error(`GAS URL returned status ${response.status}`);
      }
    } catch (err: any) {
      console.error("Failed to fetch Firebase Service Account from GAS:", err);
      firebaseInitError = `Fetch failed: ${err.message}`;
    }
  }

  if (envValue) {
    try {
      let trimmedValue = envValue.trim();
      // Handle cases where the value might be wrapped in quotes
      if (trimmedValue.startsWith("'") && trimmedValue.endsWith("'")) {
        trimmedValue = trimmedValue.slice(1, -1);
      } else if (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) {
        trimmedValue = trimmedValue.slice(1, -1);
      }
      const serviceAccount = JSON.parse(trimmedValue);
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com/`
        });
        console.log("Firebase Admin successfully initialized");
        firebaseInitError = null;
      }
    } catch (error: any) {
      console.error("Failed to initialize Firebase Admin:", error);
      firebaseInitError = `Initialization failed: ${error.message}`;
    }
  } else if (!firebaseInitError) {
    console.warn("FIREBASE_SERVICE_ACCOUNT environment variable and GAS URL are missing");
    firebaseInitError = "Missing credentials";
  }
}

initializeFirebase();

// Background job for syncing order statuses
async function syncOrderStatuses() {
  const GAS_URL = process.env.VITE_SMM_GAS_URL || 'https://script.google.com/macros/s/AKfycbzpWdoi6-VVBuYo-9TtKYu78WlkqY6n5yLvUWNrXNfAXhonoA3QrMWuOh04jVCwEFvg/exec';
  const API_KEY = process.env.SMM_API_KEY || '';
  const SMM_API_URL = 'https://yoyomedia.in/api/v2';

  if (!GAS_URL && !API_KEY) return;

  try {
    const db = admin.database();
    const ordersRef = db.ref('orders');
    const snapshot = await ordersRef.get();
    const orders = snapshot.val();

    if (!orders) return;

    const activeOrders = Object.entries(orders).filter(([_, order]: [string, any]) => 
      ['Pending', 'Processing', 'In progress', 'Partial'].includes(order.status) &&
      (order.apiOrderId || order.smmOrderId)
    );

    if (activeOrders.length === 0) return;

    console.log(`[Sync] Checking status for ${activeOrders.length} active orders...`);

    for (const [id, order] of activeOrders as [string, any][]) {
      try {
        const orderId = order.apiOrderId || order.smmOrderId;
        let statusData: any = null;

        if (GAS_URL) {
          const response = await fetch(GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'status', orderId })
          });
          statusData = await response.json();
        } else {
          const params = new URLSearchParams();
          params.append('key', API_KEY);
          params.append('action', 'status');
          params.append('order', String(orderId));

          const response = await fetch(SMM_API_URL, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': 'Mozilla/5.0'
            },
            body: params.toString()
          });
          const text = await response.text();
          statusData = JSON.parse(text);
        }
        
        if (statusData && statusData.status) {
          let newStatus = order.status;
          const providerStatus = statusData.status.toLowerCase();
          
          if (providerStatus === 'completed') newStatus = 'Completed';
          else if (providerStatus === 'processing') newStatus = 'Processing';
          else if (providerStatus === 'pending') newStatus = 'Pending';
          else if (providerStatus === 'in progress') newStatus = 'In progress';
          else if (providerStatus === 'partial') newStatus = 'Partial';
          else if (providerStatus === 'canceled' || providerStatus === 'cancelled') newStatus = 'Canceled';
          else if (providerStatus === 'refunded') newStatus = 'Canceled';

          if (newStatus !== order.status) {
            console.log(`[Sync] Order ${id} status changed: ${order.status} -> ${newStatus}`);
            await ordersRef.child(id).update({
              status: newStatus,
              remains: statusData.remains || 0,
              start_count: statusData.start_count || 0,
              updatedAt: new Date().toISOString()
            });

            // Send in-app notification
            const notifRef = db.ref(`notifications/${order.userId}`).push();
            await notifRef.set({
              title: `Order Update`,
              message: `Your order for ${order.service} is now ${newStatus}.`,
              timestamp: new Date().toISOString(),
              read: false,
              type: 'order',
              orderId: id
            });
          }
        }
      } catch (err) {
        console.error(`[Sync] Failed to sync order ${id}:`, err);
      }
    }
  } catch (error) {
    console.error("[Sync] Error in background sync job:", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // SMM API Proxy Routes
  const SMM_API_URL = 'https://yoyomedia.in/api/v2';
  const API_KEY = process.env.SMM_API_KEY || '';
  const GAS_URL = process.env.VITE_SMM_GAS_URL || 'https://script.google.com/macros/s/AKfycbzpWdoi6-VVBuYo-9TtKYu78WlkqY6n5yLvUWNrXNfAXhonoA3QrMWuOh04jVCwEFvg/exec';

  const callSmmApi = async (action: string, params: any = {}) => {
    // Try direct API first if key exists
    if (API_KEY) {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('key', API_KEY);
        queryParams.append('action', action);
        Object.entries(params).forEach(([key, val]: [string, any]) => {
          queryParams.append(key, String(val));
        });

        const response = await fetch(SMM_API_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0'
          },
          body: queryParams.toString()
        });
        
        const text = await response.text();
        if (text) return JSON.parse(text);
      } catch (err) {
        console.warn(`[Server] Direct SMM API failed, trying GAS...`, err);
      }
    }

    // Fallback to GAS Proxy
    if (GAS_URL) {
      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, ...params })
      });
      const text = await response.text();
      if (text) return JSON.parse(text);
    }

    throw new Error("No SMM API Key or GAS URL configured on server");
  };

  app.post('/api/smm/services', async (req, res) => {
    try {
      const services = await callSmmApi('services');
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/smm/order', async (req, res) => {
    try {
      const { service, link, quantity } = req.body;
      const data = await callSmmApi('add', { service, link, quantity });
      if (data.error) {
        let errorMessage = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
        
        // Check for insufficient balance error and make it friendly
        if (errorMessage.toLowerCase().includes('not enough balance') || 
            errorMessage.toLowerCase().includes('insufficient funds') ||
            errorMessage.toLowerCase().includes('charge more')) {
          errorMessage = "Server is busy. Please try again later.";
        }
        
        return res.json({ error: 'Order failed. ' + errorMessage });
      }
      res.json(data);
    } catch (error: any) {
      console.error("SMM Order Proxy Error:", error);
      res.status(500).json({ error: 'Order failed. Server is busy.' });
    }
  });

  app.post('/api/smm/balance', async (req, res) => {
    try {
      const data = await callSmmApi('balance');
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/smm/status', async (req, res) => {
    try {
      const { orderId } = req.body;
      const data = await callSmmApi('status', { orderId });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/smm/orders', async (req, res) => {
    try {
      const { orders } = req.body;
      const data = await callSmmApi('status', { order: orders });
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/admin/send-notification', async (req, res) => {
    try {
      const { tokens, title, message, url } = req.body;
      
      if (!admin.apps.length) {
        return res.status(500).json({ error: "Firebase Admin not initialized. Please set FIREBASE_SERVICE_ACCOUNT env var." });
      }

      if (!tokens || !tokens.length) {
        return res.status(400).json({ error: "No tokens provided" });
      }

      const payload: any = {
        notification: {
          title,
          body: message,
          icon: 'https://i.postimg.cc/sxNQyXFG/0x0.png',
        },
        data: {
          url: url || '/notifications'
        },
        webpush: {
          notification: {
            icon: 'https://i.postimg.cc/sxNQyXFG/0x0.png',
            badge: 'https://i.postimg.cc/sxNQyXFG/0x0.png',
            click_action: url || '/notifications'
          }
        },
        tokens: tokens
      };

      const response = await admin.messaging().sendEachForMulticast(payload);
      res.json({ success: true, response });
    } catch (error: any) {
      console.error("FCM Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/admin/check-push-config', (req, res) => {
    const hasEnv = !!process.env.FIREBASE_SERVICE_ACCOUNT;
    const appCount = admin.apps.length;
    res.json({ 
      configured: appCount > 0,
      hasEnv,
      appCount,
      envLength: process.env.FIREBASE_SERVICE_ACCOUNT?.length || 0,
      error: firebaseInitError
    });
  });

  app.post('/api/admin/recalculate-prices', async (req, res) => {
    try {
      const db = admin.database();
      const servicesRef = db.ref('services');
      const snapshot = await servicesRef.get();
      const services = snapshot.val();

      if (!services) {
        return res.json({ success: true, message: "No services to recalculate" });
      }

      const updates: Record<string, any> = {};
      Object.entries(services).forEach(([id, service]: [string, any]) => {
        const usdRate = parseFloat(service.rate);
        if (!isNaN(usdRate)) {
          const newPrice = Math.round(usdRate * 1.51 * 3800);
          updates[`${id}/price`] = newPrice;
          updates[`${id}/updatedAt`] = new Date().toISOString();
        }
      });

      await servicesRef.update(updates);
      res.json({ success: true, count: Object.keys(updates).length / 2 });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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
    
    // Start background sync every 5 minutes
    setInterval(syncOrderStatuses, 5 * 60 * 1000);
    // Initial run after 30 seconds
    setTimeout(syncOrderStatuses, 30 * 1000);
  });
}

startServer();