/**
 * SUPER BOOST PAYMENT BACKEND (Google Apps Script)
 * Updated for MarzPay 2026 API Specifications
 * Developer: Piustech
 */

// --- CONFIGURATION ---
const MARZPAY_API_KEY = "marz_xmeCqRz0rGEme73o";
const MARZPAY_API_SECRET = "JN7T30E2vZquBUbLZyxlZRzAhKAyJW4B";
const FIREBASE_DB_URL = "https://easyboost-f6ac5-default-rtdb.firebaseio.com/"; 
const FIREBASE_AUTH = "bqvL37nBIPlxBBBm4CiesQIQJhNihnI6o7u9gzw0"; 

/**
 * Main entry point for POST requests from Frontend & MarzPay Webhooks
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    Logger.log("Incoming JSON: " + JSON.stringify(postData));
    
    // 1. Check if it's a MarzPay Webhook (event_type exists)
    if (postData.event_type || postData.event) {
      return handleWebhook(postData);
    }
    
    // 2. Check if it's a status check from frontend
    if (postData.action === 'status') {
      return handleStatusCheck(postData);
    }
    
    // 3. Otherwise, treat as Frontend Payment Initiation
    return handlePaymentRequest(postData);
    
  } catch (error) {
    Logger.log("Critical Error: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      "status": "error",
      "message": error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles Status Checks from Frontend
 */
function handleStatusCheck(data) {
  const reference = data.reference;
  if (!reference) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "Missing reference"})).setMimeType(ContentService.MimeType.JSON);
  }
  
  const payment = firebaseGet("payments/" + reference);
  if (!payment) {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "Not found"})).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify(payment)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handles Webhooks from MarzPay
 */
function handleWebhook(payload) {
  Logger.log("Processing Webhook...");
  
  // MarzPay payloads can be nested in 'data'
  const data = payload.data || payload;
  const transaction = data.transaction || payload.transaction;
  const collection = data.collection || payload.collection;
  
  const reference = transaction?.reference || collection?.reference || payload.reference;
  const status = (transaction?.status || collection?.status || payload.status || "").toLowerCase();
  
  Logger.log("Webhook Ref: " + reference + " Status: " + status);

  if (reference && (status === "successful" || status === "completed" || status === "success")) {
    const paymentPath = "payments/" + reference;
    const paymentRecord = firebaseGet(paymentPath);

    if (paymentRecord && paymentRecord.status === "pending") {
      const userId = paymentRecord.userId;
      // Extract amount correctly from transaction object
      const amountToCredit = Number(transaction?.amount?.raw || transaction?.amount || collection?.amount?.raw || 0);
      
      if (amountToCredit > 0) {
        Logger.log("Crediting User: " + userId + " Amount: " + amountToCredit);
        updateUserBalance(userId, amountToCredit);
        
        // Update payment status to Successful (harmonized with Node.js)
        firebasePatch(paymentPath, {
          "status": "completed",
          "completedAt": new Date().toISOString(),
          "amount_credited": amountToCredit,
          "provider_id": transaction?.id || "N/A"
        });
        
        return ContentService.createTextOutput(JSON.stringify({"status": "success", "message": "Balance updated"})).setMimeType(ContentService.MimeType.JSON);
      }
    } else {
      Logger.log("Payment already processed or not found: " + reference);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({"status": "ignored"})).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Initiates a payment with MarzPay
 */
function handlePaymentRequest(data) {
  const { userId, amount, phone, method, username } = data;
  const reference = Utilities.getUuid();
  
  // Save pending payment to Firebase
  const paymentData = {
    "reference": reference,
    "userId": userId,
    "username": username || "User",
    "amount": Number(amount),
    "phone": phone,
    "status": "pending",
    "createdAt": new Date().toISOString(),
    "source": "GAS-Initiated"
  };
  
  firebasePut("payments/" + reference, paymentData);

  // Call MarzPay API
  const authHeader = "Basic " + Utilities.base64Encode(MARZPAY_API_KEY + ":" + MARZPAY_API_SECRET);
  const payload = {
    "amount": Math.floor(Number(amount)),
    "country": "UG",
    "reference": reference,
    "description": "Super Boost Top-up",
    "phone_number": phone,
    "callback_url": ScriptApp.getService().getUrl()
  };

  const options = {
    "method": "post",
    "contentType": "application/json",
    "headers": { "Authorization": authHeader },
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  const response = UrlFetchApp.fetch("https://wallet.wearemarz.com/api/v1/collect-money", options);
  const result = JSON.parse(response.getContentText());
  
  // Add reference to the response so frontend can poll
  result.reference = reference;
  
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Updates User Balance in Firebase
 */
function updateUserBalance(userId, amount) {
  const path = "users/" + userId;
  const user = firebaseGet(path);
  const currentBalance = (user && user.balance) ? Number(user.balance) : 0;
  const newBalance = currentBalance + amount;
  
  firebasePatch(path, { "balance": newBalance });
  
  // Send notification
  const notifPath = "notifications/" + userId;
  firebasePush(notifPath, {
    "title": "Deposit Successful",
    "message": "UGX " + amount.toLocaleString() + " added to your wallet.",
    "timestamp": new Date().toISOString(),
    "status": "unread",
    "type": "deposit"
  });
}

// --- FIREBASE HELPERS ---
function firebaseGet(path) {
  const url = FIREBASE_DB_URL + path + ".json?auth=" + FIREBASE_AUTH;
  const res = UrlFetchApp.fetch(url);
  return JSON.parse(res.getContentText());
}

function firebasePut(path, data) {
  const url = FIREBASE_DB_URL + path + ".json?auth=" + FIREBASE_AUTH;
  UrlFetchApp.fetch(url, { "method": "put", "payload": JSON.stringify(data) });
}

function firebasePatch(path, data) {
  const url = FIREBASE_DB_URL + path + ".json?auth=" + FIREBASE_AUTH;
  UrlFetchApp.fetch(url, { "method": "patch", "payload": JSON.stringify(data) });
}

function firebasePush(path, data) {
  const url = FIREBASE_DB_URL + path + ".json?auth=" + FIREBASE_AUTH;
  UrlFetchApp.fetch(url, { "method": "post", "payload": JSON.stringify(data) });
}
