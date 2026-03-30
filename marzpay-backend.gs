/**
 * MarzPay Payment Backend (Google Apps Script)
 * 
 * This script handles MarzPay payment initiation, status checks, and webhooks.
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Go to script.google.com
 * 2. Create a new project named "MarzPay Backend".
 * 3. Paste this code into the editor.
 * 4. Update the CONFIGURATION section below.
 * 5. Click "Deploy" > "New Deployment".
 * 6. Select "Web App".
 * 7. Set "Execute as" to "Me".
 * 8. Set "Who has access" to "Anyone".
 * 9. Click "Deploy" and copy the "Web App URL".
 * 10. Add this URL to your Vercel/Environment variables as VITE_MARZPAY_GAS_URL.
 */

// --- CONFIGURATION ---
const MARZPAY_API_KEY = "marz_xmeCqRz0rGEme73o";
const MARZPAY_API_SECRET = "JN7T30E2vZquBUbLZyxlZRzAhKAyJW4B";

const FIREBASE_DB_URL = "https://easyboost-f6ac5-default-rtdb.firebaseio.com/"; // Must have trailing slash
const FIREBASE_AUTH = "bqvL37nBIPlxBBBm4CiesQIQJhNihnI6o7u9gzw0"; // Get from Firebase Project Settings

/**
 * Main entry point for all POST requests
 */
function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) {
      return createResponse({ error: "No data provided" });
    }

    const postData = JSON.parse(e.postData.contents);
    
    // 1. ROUTE: MarzPay Webhook (Detected by event_type)
    if (postData.event_type) {
      return handleMarzPayWebhook(postData);
    }

    // 2. ROUTE: MarzPay Status Check (Detected by action: 'status' + reference)
    if (postData.action === 'status' && postData.reference) {
      return handleMarzPayStatusCheck(postData);
    }

    // 3. ROUTE: MarzPay Initiation (Detected by userId + amount)
    // We check for userId and amount to identify initiation requests
    if (postData.userId && postData.amount) {
      return handleMarzPayInitiation(postData);
    }

    return createResponse({ error: "No valid action or data specified" });

  } catch (error) {
    return createResponse({ error: "MarzPay Proxy Error: " + error.toString() });
  }
}

/**
 * MarzPay Initiation Logic
 */
function handleMarzPayInitiation(data) {
  const { phone, amount, userId, userEmail, method } = data;
  const isCard = method === 'card';
  const reference = Utilities.getUuid(); 
  
  // Save to Firebase
  const paymentData = {
    reference: reference,
    userId: userId,
    userEmail: userEmail || "",
    amount: Number(amount),
    phone: phone || "CARD",
    method: method || "mobile_money",
    status: "pending",
    createdAt: new Date().toISOString()
  };
  firebasePut("payments/" + reference, paymentData);
  
  // Call MarzPay
  const authHeader = "Basic " + Utilities.base64Encode(MARZPAY_API_KEY + ":" + MARZPAY_API_SECRET);
  const payload = {
    "amount": Math.floor(Number(amount)),
    "country": "UG",
    "reference": reference,
    "description": "EasyBoost Top-up",
    "method": method || "mobile_money",
    "callback_url": ScriptApp.getService().getUrl()
  };
  if (!isCard) payload["phone_number"] = phone;

  const options = {
    method: "post",
    contentType: "application/json",
    headers: { "Authorization": authHeader },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch("https://wallet.wearemarz.com/api/v1/collect-money", options);
  const result = JSON.parse(response.getContentText());
  
  if (response.getResponseCode() > 299) {
    return createResponse({ success: false, message: result.message || "MarzPay Error" });
  }
  
  const responseData = {
    success: true,
    reference: reference,
    message: "Initiated"
  };
  if (isCard && result.data && result.data.redirect_url) {
    responseData.redirectUrl = result.data.redirect_url;
  }
  return createResponse(responseData);
}

/**
 * MarzPay Webhook Logic
 */
function handleMarzPayWebhook(payload) {
  const data = payload.data || payload;
  const transaction = data.transaction || payload.transaction;
  
  if (!transaction || payload.event_type !== "collection.completed") {
    return createResponse({ received: true });
  }
  
  const reference = transaction.reference;
  const status = (transaction.status || "").toLowerCase();
  
  if (status === "completed" || status === "successful" || status === "success") {
    const paymentRecord = firebaseGet("payments/" + reference);
    if (paymentRecord && paymentRecord.status === "pending") {
      const amount = Number(transaction.amount?.raw || transaction.amount || 0);
      updateUserBalance(paymentRecord.userId, amount);
      
      firebasePatch("payments/" + reference, {
        status: "Successful",
        completedAt: new Date().toISOString()
      });
      
      firebasePush("notifications/" + paymentRecord.userId, {
        message: "Deposit of UGX " + amount.toLocaleString() + " successful.",
        type: "deposit",
        timestamp: new Date().toISOString(),
        read: false
      });
    }
  }
  return createResponse({ received: true });
}

/**
 * MarzPay Status Check Logic
 */
function handleMarzPayStatusCheck(data) {
  const payment = firebaseGet("payments/" + data.reference);
  if (!payment) return createResponse({ error: "Not found" });
  return createResponse({ status: payment.status, reference: payment.reference });
}

// --- HELPERS ---

function getFirebaseUrl(path) {
  return FIREBASE_DB_URL + path + ".json" + (FIREBASE_AUTH ? "?auth=" + FIREBASE_AUTH : "");
}

function firebaseGet(path) {
  const response = UrlFetchApp.fetch(getFirebaseUrl(path));
  return JSON.parse(response.getContentText());
}

function firebasePut(path, data) {
  UrlFetchApp.fetch(getFirebaseUrl(path), { method: "put", contentType: "application/json", payload: JSON.stringify(data) });
}

function firebasePatch(path, data) {
  UrlFetchApp.fetch(getFirebaseUrl(path), { method: "patch", contentType: "application/json", payload: JSON.stringify(data) });
}

function firebasePush(path, data) {
  UrlFetchApp.fetch(getFirebaseUrl(path), { method: "post", contentType: "application/json", payload: JSON.stringify(data) });
}

function updateUserBalance(userId, amount) {
  const path = "users/" + userId;
  const user = firebaseGet(path);
  const currentBalance = (user && user.balance) ? Number(user.balance) : 0;
  firebasePatch(path, { balance: currentBalance + amount });
}

function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
