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
// Background job for syncing order statuses and drop detection
async function syncOrderStatuses() {
  const GAS_URL = process.env.VITE_SMM_GAS_URL || 'https://script.google.com/macros/s/AKfycbyJV7Rdv_6O2XDvowgCldCGW00pbFxrWlvvevzx6zr-05TsQJubWE42HjJ0vhNtG72N/exec';
  const API_KEY = process.env.SMM_API_KEY || '';
  const SMM_API_URL = 'https://morethanpanel.com/api/v2';

  if (!GAS_URL && !API_KEY) return;

  try {
    const db = admin.database();
    const ordersRef = db.ref('orders');
    const snapshot = await ordersRef.get();
    const orders = snapshot.val();

    if (!orders) return;

    const now = Date.now();
    
    // 1. Sync Active Orders (Pending, Processing, etc.)
    const activeOrders = Object.entries(orders).filter(([_, order]: [string, any]) => 
      ['Pending', 'Processing', 'In progress', 'Partial'].includes(order.status) &&
      (order.apiOrderId || order.smmOrderId)
    );

    // 2. Drop Detection for Completed Guaranteed Orders
    const completedGuaranteedOrders = Object.entries(orders).filter(([_, order]: [string, any]) => 
      order.status === 'Completed' && 
      order.guaranteed === true && 
      !order.refunded &&
      (!order.last_checked_at || (now - order.last_checked_at) > 15 * 60 * 1000) // Check every 15 mins
    );

    const ordersToSync = [...activeOrders, ...completedGuaranteedOrders];

    if (ordersToSync.length === 0) return;

    console.log(`[Sync] Checking status for ${ordersToSync.length} orders (${activeOrders.length} active, ${completedGuaranteedOrders.length} drop detection)...`);

    for (const [id, order] of ordersToSync as [string, any][]) {
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
          else if (providerStatus === 'processing' || providerStatus === 'in progress') newStatus = 'Processing';
          else if (providerStatus === 'pending') newStatus = 'Pending';
          else if (providerStatus === 'partial') newStatus = 'Partial';
          else if (providerStatus === 'canceled' || providerStatus === 'cancelled' || providerStatus === 'failed') newStatus = 'Canceled';
          else if (providerStatus === 'refunded') newStatus = 'Canceled';

          const remains = parseFloat(statusData.remains || 0);
          const startCount = parseFloat(statusData.start_count || 0);
          
          // Drop Detection Logic
          if (order.status === 'Completed' && order.guaranteed) {
            if (remains > 0 || providerStatus === 'partial') {
              console.log(`[Drop Detection] Drop detected for order ${id}. Remains: ${remains}`);
              
              // Trigger Action
              if (order.refill) {
                // Call Refill API
                try {
                  let refillResult: any = null;
                  if (GAS_URL) {
                    const response = await fetch(GAS_URL, {
                      method: 'POST',
                      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                      body: JSON.stringify({ action: 'refill', order: orderId })
                    });
                    refillResult = await response.json();
                  } else {
                    const params = new URLSearchParams();
                    params.append('key', API_KEY);
                    params.append('action', 'refill');
                    params.append('order', String(orderId));
                    const response = await fetch(SMM_API_URL, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                      body: params.toString()
                    });
                    refillResult = await response.json();
                  }

                  if (refillResult && refillResult.refill) {
                    await ordersRef.child(id).update({
                      refillId: refillResult.refill,
                      refillTriggered: true,
                      drop_detected: true,
                      last_checked_at: admin.database.ServerValue.TIMESTAMP
                    });

                    // Notify User
                    const notifRef = db.ref(`notifications/${order.userId}`).push();
                    await notifRef.set({
                      title: `Auto-Refill Triggered`,
                      message: `A drop was detected in your order for ${order.serviceName || order.service}. We have automatically triggered a refill.`,
                      timestamp: new Date().toISOString(),
                      read: false,
                      type: 'refill',
                      orderId: id
                    });
                  }
                } catch (refillErr) {
                  console.error(`[Drop Detection] Failed to trigger refill for order ${id}:`, refillErr);
                }
              } else {
                // Calculate Refund
                const totalQty = parseFloat(order.quantity || 0);
                const paidAmount = parseFloat(order.charge || order.price || 0);
                
                if (totalQty > 0 && remains > 0) {
                  const refundAmount = (remains / totalQty) * paidAmount;
                  if (refundAmount > 0) {
                    const userRef = db.ref(`users/${order.userId}`);
                    const userSnap = await userRef.get();
                    const userData = userSnap.val();
                    
                    if (userData) {
                      const newBalance = (userData.balance || 0) + refundAmount;
                      await userRef.update({ balance: newBalance });
                      
                      // Log Refund
                      await db.ref('refund_logs').push({
                        userId: order.userId,
                        orderId: id,
                        amount: refundAmount,
                        status: 'Partial Refund (Drop)',
                        timestamp: admin.database.ServerValue.TIMESTAMP
                      });

                      // Notify User
                      const notifRef = db.ref(`notifications/${order.userId}`).push();
                      await notifRef.set({
                        title: `Refund Issued`,
                        message: `UGX ${Math.round(refundAmount).toLocaleString()} has been refunded to your wallet due to a drop in your order for ${order.serviceName || order.service}.`,
                        timestamp: new Date().toISOString(),
                        read: false,
                        type: 'refund',
                        orderId: id
                      });

                      await ordersRef.child(id).update({
                        status: 'Partial Refunded',
                        refunded: true,
                        refundAmount,
                        drop_detected: true,
                        last_checked_at: admin.database.ServerValue.TIMESTAMP
                      });
                    }
                  }
                }
              }
            } else {
              // No drop detected, update last checked
              await ordersRef.child(id).update({
                last_checked_at: admin.database.ServerValue.TIMESTAMP
              });
            }
          }

          if (newStatus !== order.status) {
            console.log(`[Sync] Order ${id} status changed: ${order.status} -> ${newStatus}`);
            
            // Handle Refund Logic for Canceled/Partial
            if ((newStatus === 'Canceled' || newStatus === 'Partial') && !order.refunded) {
              const remainsVal = parseFloat(statusData.remains || 0);
              const totalQty = parseFloat(order.quantity || 0);
              const paidAmount = parseFloat(order.charge || order.price || 0);
              
              let refundAmount = 0;
              if (newStatus === 'Canceled') {
                refundAmount = paidAmount;
              } else if (newStatus === 'Partial' && remainsVal > 0 && totalQty > 0) {
                refundAmount = (remainsVal / totalQty) * paidAmount;
              }

              if (refundAmount > 0) {
                const userRef = db.ref(`users/${order.userId}`);
                const userSnap = await userRef.get();
                const userData = userSnap.val();
                
                if (userData) {
                  const newBalance = (userData.balance || 0) + refundAmount;
                  await userRef.update({ balance: newBalance });
                  
                  // Log Refund
                  await db.ref('refund_logs').push({
                    userId: order.userId,
                    orderId: id,
                    amount: refundAmount,
                    status: newStatus,
                    timestamp: admin.database.ServerValue.TIMESTAMP
                  });

                  // Notify User
                  const notifRef = db.ref(`notifications/${order.userId}`).push();
                  await notifRef.set({
                    title: `Order Refunded`,
                    message: `Your order for ${order.serviceName || order.service} was ${newStatus.toLowerCase()}. UGX ${Math.round(refundAmount).toLocaleString()} has been refunded to your wallet.`,
                    timestamp: new Date().toISOString(),
                    read: false,
                    type: 'refund',
                    orderId: id
                  });

                  // Mark order as refunded
                  await ordersRef.child(id).update({ refunded: true, refundAmount });
                }
              }
            }

            await ordersRef.child(id).update({
              status: newStatus,
              remains: statusData.remains || 0,
              start_count: statusData.start_count || 0,
              updatedAt: new Date().toISOString()
            });

            // Send in-app notification for status change (if not already notified by refund)
            if (!(newStatus === 'Canceled' || newStatus === 'Partial')) {
              const notifRef = db.ref(`notifications/${order.userId}`).push();
              await notifRef.set({
                title: `Order Update`,
                message: `Your order for ${order.serviceName || order.service} is now ${newStatus}.`,
                timestamp: new Date().toISOString(),
                read: false,
                type: 'order',
                orderId: id
              });
            }
          }

          // Check Refill Status if active
          if (order.refillTriggered && order.refillId && order.refillStatus !== 'Completed') {
            try {
              let refillData: any = null;
              if (GAS_URL) {
                const response = await fetch(GAS_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                  body: JSON.stringify({ action: 'refill_status', refillId: order.refillId })
                });
                refillData = await response.json();
              } else {
                const params = new URLSearchParams();
                params.append('key', API_KEY);
                params.append('action', 'refill_status');
                params.append('refill', String(order.refillId));

                const response = await fetch(SMM_API_URL, {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0'
                  },
                  body: params.toString()
                });
                const text = await response.text();
                refillData = JSON.parse(text);
              }

              if (refillData && refillData.status) {
                await ordersRef.child(id).update({
                  refillStatus: refillData.status,
                  updatedAt: new Date().toISOString()
                });
              }
            } catch (refillErr) {
              console.error(`[Sync] Failed to sync refill status for order ${id}:`, refillErr);
            }
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
  const SMM_API_URL = 'https://morethanpanel.com/api/v2';
  const API_KEY = process.env.SMM_API_KEY || '';
  const GAS_URL = process.env.VITE_SMM_GAS_URL || 'https://script.google.com/macros/s/AKfycbyJV7Rdv_6O2XDvowgCldCGW00pbFxrWlvvevzx6zr-05TsQJubWE42HjJ0vhNtG72N/exec';

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

  // Helper to find user by API key
  const getUserByApiKey = async (apiKey: string) => {
    if (!apiKey) return null;
    const usersRef = admin.database().ref('users');
    const snapshot = await usersRef.orderByChild('apiKey').equalTo(apiKey).once('value');
    const users = snapshot.val();
    if (!users) return null;
    const uid = Object.keys(users)[0];
    return { uid, ...users[uid] };
  };

  // Simple in-memory rate limiting for public API
  const apiRateLimits = new Map<string, { count: number, resetAt: number }>();
  const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  const MAX_REQUESTS_PER_WINDOW = 30; // 30 requests per minute

  // Public API v2 (Standard SMM structure)
  app.post('/api/v2', async (req, res) => {
    try {
      const { key, action } = req.body;
      
      if (!key) return res.json({ error: 'API key is required' });
      if (!action) return res.json({ error: 'Action is required' });

      // Rate limiting check
      const now = Date.now();
      const limit = apiRateLimits.get(key) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW };
      
      if (now > limit.resetAt) {
        limit.count = 1;
        limit.resetAt = now + RATE_LIMIT_WINDOW;
      } else {
        limit.count++;
      }
      apiRateLimits.set(key, limit);

      if (limit.count > MAX_REQUESTS_PER_WINDOW) {
        return res.json({ error: 'Rate limit exceeded. Please try again in a minute.' });
      }

      const user = await getUserByApiKey(key);
      if (!user) return res.json({ error: 'Invalid API key' });
      if (user.apiDisabled) return res.json({ error: 'API access is disabled for this account' });

      // Log API request
      const logsRef = admin.database().ref('api_logs');
      await logsRef.push({
        userId: user.uid,
        action,
        timestamp: admin.database.ServerValue.TIMESTAMP,
        ip: req.ip
      });

      switch (action) {
        case 'services': {
          const services = await callSmmApi('services');
          const settingsRef = admin.database().ref('settings');
          const settingsSnap = await settingsRef.once('value');
          const settings = settingsSnap.val() || { profitPercentage: 51 };
          const profitMargin = (settings.profitPercentage || 51) / 100;

          const formattedServices = services.map((s: any) => {
            // Auto-detect sub-category
            let subCategory = 'General';
            const name = s.name.toLowerCase();
            if (name.includes('follower')) subCategory = 'Followers';
            else if (name.includes('like')) subCategory = 'Likes';
            else if (name.includes('view')) subCategory = 'Views';
            else if (name.includes('subscriber')) subCategory = 'Subscribers';
            else if (name.includes('member')) subCategory = 'Members';
            else if (name.includes('comment')) subCategory = 'Comments';
            else if (name.includes('share')) subCategory = 'Shares';
            else if (name.includes('live')) subCategory = 'Live';
            else if (name.includes('reel')) subCategory = 'Reels';
            else if (name.includes('story')) subCategory = 'Story';
            else if (name.includes('target')) subCategory = 'Targeted';
            else if (name.includes('reaction')) subCategory = 'Reactions';
            else if (name.includes('watch time')) subCategory = 'Watch Time';

            // Badges
            const badges = [];
            if (s.refill) badges.push('guaranteed');
            if (parseFloat(s.rate) < 0.5) badges.push('best_value');
            // Trending logic would ideally be based on DB order counts, but for API response we can mock or use a simple heuristic
            
            return {
              service: s.service,
              name: s.name,
              category: s.category,
              rate: (parseFloat(s.rate) * (1 + profitMargin)).toFixed(2),
              min: s.min,
              max: s.max,
              type: s.type,
              refill: s.refill,
              cancel: s.cancel,
              description: s.description || s.instructions || "No instructions provided",
              guaranteed: !!s.refill,
              badges: badges,
              sub_category: subCategory
            };
          });
          return res.json(formattedServices);
        }

        case 'add': {
          const { service, link, quantity } = req.body;
          if (!service || !link || !quantity) return res.json({ error: 'Missing parameters' });

          // Get service details to check price
          const services = await callSmmApi('services');
          const smmService = services.find((s: any) => s.service.toString() === service.toString());
          if (!smmService) return res.json({ error: 'Service not found' });

          const settingsRef = admin.database().ref('settings');
          const settingsSnap = await settingsRef.once('value');
          const settings = settingsSnap.val() || { profitPercentage: 51 };
          const profitMargin = (settings.profitPercentage || 51) / 100;
          
          const rate = parseFloat(smmService.rate) * (1 + profitMargin);
          const cost = (rate * parseInt(quantity)) / 1000;
          const providerCost = (parseFloat(smmService.rate) * parseInt(quantity)) / 1000;
          const profit = cost - providerCost;

          if (user.balance < cost) return res.json({ error: 'Insufficient balance' });

          // Place order with provider
          const data = await callSmmApi('add', { service, link, quantity });
          if (data.error) return res.json({ error: data.error });

          // Deduct balance and record order
          const userRef = admin.database().ref(`users/${user.uid}`);
          await userRef.update({ balance: user.balance - cost });

          const orderId = data.order;
          const ordersRef = admin.database().ref(`orders/${orderId}`);
          await ordersRef.set({
            orderId,
            apiOrderId: orderId,
            userId: user.uid,
            serviceId: service,
            serviceName: smmService.name,
            link,
            quantity,
            charge: cost,
            price: cost,
            provider_cost: providerCost,
            profit: profit,
            status: 'Pending',
            createdAt: admin.database.ServerValue.TIMESTAMP,
            source: 'api',
            guaranteed: !!smmService.refill,
            refill: !!smmService.refill,
            start_count: 0,
            remains: quantity,
            last_checked_at: admin.database.ServerValue.TIMESTAMP
          });

          // Increment order count for trending logic
          const serviceStatsRef = admin.database().ref(`service_stats/${service}`);
          await serviceStatsRef.transaction((current) => {
            return (current || 0) + 1;
          });

          return res.json({ order: orderId });
        }

        case 'status': {
          const { order, orders } = req.body;
          if (order) {
            const data = await callSmmApi('status', { orderId: order });
            return res.json({
              charge: data.charge || "0",
              start_count: data.start_count || "0",
              status: data.status || "Pending",
              remains: data.remains || "0",
              currency: "UGX"
            });
          } else if (orders) {
            const orderIds = orders.toString().split(',');
            const results: any = {};
            for (const id of orderIds) {
              const data = await callSmmApi('status', { orderId: id.trim() });
              results[id.trim()] = {
                status: data.status || "Pending",
                charge: data.charge || "0",
                start_count: data.start_count || "0",
                remains: data.remains || "0"
              };
            }
            return res.json(results);
          }
          return res.json({ error: 'Order ID required' });
        }

        case 'balance': {
          return res.json({
            balance: user.balance.toFixed(2),
            currency: "UGX"
          });
        }

        default:
          return res.json({ error: 'Invalid action' });
      }
    } catch (error: any) {
      console.error("Public API Error:", error);
      res.json({ error: 'Internal server error' });
    }
  });

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
    
    // Start background sync every 3 minutes
    setInterval(syncOrderStatuses, 3 * 60 * 1000);
    // Initial run after 30 seconds
    setTimeout(syncOrderStatuses, 30 * 1000);
  });
}

startServer();