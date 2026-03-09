import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import admin from 'firebase-admin';

dotenv.config();

// Initialize Firebase Admin
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com/`
      });
      console.log("Firebase Admin initialized with Database support");
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
  }
}

// Background job for syncing order statuses
async function syncOrderStatuses() {
  const GAS_URL = process.env.VITE_SMM_GAS_URL;
  if (!GAS_URL) return;

  try {
    const db = admin.database();
    const ordersRef = db.ref('orders');
    const snapshot = await ordersRef.get();
    const orders = snapshot.val();

    if (!orders) return;

    const activeOrders = Object.entries(orders).filter(([_, order]: [string, any]) => 
      ['Pending', 'Processing', 'In progress', 'Partial'].includes(order.status) &&
      order.smmOrderId
    );

    if (activeOrders.length === 0) return;

    console.log(`[Sync] Checking status for ${activeOrders.length} active orders...`);

    for (const [id, order] of activeOrders as [string, any][]) {
      try {
        const response = await fetch(GAS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'status', orderId: order.smmOrderId })
        });

        const statusData: any = await response.json();
        
        if (statusData.status) {
          let newStatus = order.status;
          const providerStatus = statusData.status.toLowerCase();
          
          if (providerStatus === 'completed') newStatus = 'Delivered';
          else if (providerStatus === 'processing') newStatus = 'Processing';
          else if (providerStatus === 'in progress') newStatus = 'In progress';
          else if (providerStatus === 'partial') newStatus = 'Partial';
          else if (providerStatus === 'canceled' || providerStatus === 'cancelled') newStatus = 'Cancelled';
          else if (providerStatus === 'refunded') newStatus = 'Cancelled';

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
  const SMM_API_URL = 'https://smmtrustpanel.com/api/v2';
  const API_KEY = process.env.SMM_API_KEY || '';

  if (!API_KEY && !process.env.VITE_SMM_GAS_URL) {
    console.warn("WARNING: SMM_API_KEY is not set and VITE_SMM_GAS_URL is not set. SMM features will not work.");
  }

  app.post('/api/smm/services', async (req, res) => {
    try {
      const params = new URLSearchParams();
      params.append('key', API_KEY);
      params.append('action', 'services');

      const response = await fetch(SMM_API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0'
        },
        body: params.toString()
      });
      
      const text = await response.text();
      if (!text) throw new Error("Empty response from provider API");
      
      try {
        const services = JSON.parse(text);
        res.json(services);
      } catch (e) {
        console.error("JSON Parse Error (Services):", text);
        throw new Error("Invalid JSON response from provider API");
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/smm/order', async (req, res) => {
    try {
      const { service, link, quantity } = req.body;
      
      const params = new URLSearchParams();
      params.append('key', API_KEY);
      params.append('action', 'add');
      params.append('service', String(service));
      params.append('link', link);
      params.append('quantity', String(quantity));

      console.log("Sending order request to provider:", params.toString().replace(API_KEY, 'HIDDEN_KEY'));

      const response = await fetch(SMM_API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0'
        },
        body: params.toString()
      });
      
      const text = await response.text();
      console.log("Provider raw response:", text);

      if (!text || text.trim() === "") {
        return res.json({ error: 'Provider returned an empty response' });
      }
      
      if (text.trim().startsWith("{") || text.trim().startsWith("[")) {
        try {
          const data = JSON.parse(text);
          if (data.error) {
            return res.json({ error: 'Order failed. Provider returned an error: ' + (typeof data.error === 'string' ? data.error : JSON.stringify(data.error)) });
          }
          return res.json(data);
        } catch (e) {
          return res.json({ error: 'Provider did not return valid JSON: ' + text });
        }
      } else {
        return res.json({ error: 'Provider did not return JSON: ' + text });
      }
    } catch (error: any) {
      console.error("SMM Order Proxy Error:", error);
      res.status(500).json({ error: 'Order failed. Provider returned an error: ' + error.message });
    }
  });

  app.post('/api/smm/balance', async (req, res) => {
    try {
      const params = new URLSearchParams();
      params.append('key', API_KEY);
      params.append('action', 'balance');

      const response = await fetch(SMM_API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0'
        },
        body: params.toString()
      });
      
      const text = await response.text();
      if (!text) throw new Error("Empty response from provider API");
      
      try {
        const data = JSON.parse(text);
        res.json(data);
      } catch (e) {
        console.error("JSON Parse Error (Balance):", text);
        throw new Error("Invalid JSON response from provider API");
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/smm/status', async (req, res) => {
    try {
      const { orderId } = req.body;
      
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
      if (!text) throw new Error("Empty response from provider API");
      
      try {
        const data = JSON.parse(text);
        res.json(data);
      } catch (e) {
        console.error("JSON Parse Error (Status):", text);
        throw new Error("Invalid JSON response from provider API");
      }
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
    const configured = !!process.env.FIREBASE_SERVICE_ACCOUNT;
    res.json({ configured });
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