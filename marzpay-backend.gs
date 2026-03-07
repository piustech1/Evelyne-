/**
 * EASYBOOST PAYMENT BACKEND (Google Apps Script - 2026 Specs)
 * 
 * Backend URL: https://script.google.com/macros/s/AKfycbx3R9hK-5O-ROqvY3XVkBaqOgSE1XXolFg35xD73p__aY274FHPNZN3qeNE1dnZMjmy/exec
 */

// --- CONFIGURATION ---
const MARZPAY_API_KEY = "YOUR_MARZPAY_API_KEY";
const MARZPAY_API_SECRET = "YOUR_MARZPAY_API_SECRET";
const FIREBASE_DB_URL = "https://your-project-id.firebaseio.com/"; // Include trailing slash
const FIREBASE_SECRET = "YOUR_FIREBASE_DATABASE_SECRET"; // For ?auth= parameter

/**
 * Main entry point for POST requests (CORS compliant)
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    Logger.log("Incoming Request: " + JSON.stringify(postData));
    
    // Check if it's a MarzPay Webhook (contains event_type)
    if (postData.event_type) {
      return handleWebhook(postData);
    }
    
    // Otherwise, assume it's a Payment Request from the frontend
    return handlePaymentRequest(postData);
    
  } catch (error) {
    Logger.log("Critical Error: " + error.toString());
    return jsonResponse({
      success: false,
      message: "Server Error: " + error.toString()
    });
  }
}

/**
 * PART 1: Handle Payment Initiation from Frontend
 */
function handlePaymentRequest(data) {
  const { phone, amount, userId, userEmail, username } = data;
  
  if (!phone || !amount || !userId) {
    return jsonResponse({ success: false, message: "Missing required fields (phone, amount, userId)" });
  }
  
  // Requirement: Every collect-money request MUST have a unique reference in UUID v4 format
  const reference = generateUUID();
  Logger.log("Initiating Payment Request. Ref: " + reference);
  
  // 1. Save pending payment to Firebase (REST Protocol: .json?auth=)
  const paymentData = {
    reference: reference,
    userId: userId,
    userEmail: userEmail || "",
    username: username || "User",
    amount: Number(amount),
    phone: phone,
    status: "pending",
    createdAt: new Date().toISOString(),
    source: "GoogleAppsScript"
  };
  
  firebasePut("payments/" + reference, paymentData);
  
  // 2. Call MarzPay API (Basic Auth: base64(API_KEY:API_SECRET))
  const auth = Utilities.base64Encode(MARZPAY_API_KEY + ":" + MARZPAY_API_SECRET);
  const payload = {
    amount: Math.floor(Number(amount)),
    phone_number: phone,
    country: "UG",
    reference: reference,
    description: "Wallet Top-up",
    callback_url: "https://script.google.com/macros/s/AKfycbx3R9hK-5O-ROqvY3XVkBaqOgSE1XXolFg35xD73p__aY274FHPNZN3qeNE1dnZMjmy/exec"
  };
  
  const options = {
    method: "post",
    contentType: "application/json",
    headers: { "Authorization": "Basic " + auth },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch("https://wallet.wearemarz.com/api/v1/collect-money", options);
  const result = JSON.parse(response.getContentText());
  
  Logger.log("MarzPay API Response: " + response.getContentText());
  
  if (response.getResponseCode() !== 200 && response.getResponseCode() !== 201) {
    return jsonResponse({ 
      success: false, 
      message: result.message || "MarzPay initiation failed" 
    });
  }
  
  return jsonResponse({
    success: true,
    reference: reference,
    message: "Payment initiated"
  });
}

/**
 * PART 2: Handle Webhook Notification from MarzPay
 */
function handleWebhook(payload) {
  Logger.log("Webhook Received: " + JSON.stringify(payload));
  
  // Extract transaction data (MarzPay sends it inside 'data.transaction')
  const transaction = payload.data ? payload.data.transaction : payload.transaction;
  
  // Requirement: MarzPay uses the keyword 'completed' (lowercase)
  if (!transaction || payload.event_type !== "collection.completed" || transaction.status !== "completed") {
    return jsonResponse({ received: true, message: "Ignored event type or status" });
  }
  
  const reference = transaction.reference;
  
  // 1. Fetch Payment Record from Firebase
  const payment = firebaseGet("payments/" + reference);
  
  if (payment && (payment.status === "pending" || payment.status === "Pending")) {
    const userId = payment.userId;
    
    // Requirement: Extract the amount from transaction.amount.raw
    const amountRaw = transaction.amount ? (transaction.amount.raw || transaction.amount) : payment.amount;
    const amount = Number(amountRaw);
    
    // 2. Update User Balance (Fetch current, add, PATCH)
    updateUserBalance(userId, amount);
    
    // 3. Update Payment Status to Successful
    firebasePatch("payments/" + reference, {
      status: "Successful",
      completedAt: new Date().toISOString(),
      provider: transaction.provider || "MarzPay",
      rawAmountReceived: amount
    });
    
    // 4. Create Notification for User
    const notification = {
      message: "Deposit successful! UGX " + amount.toLocaleString() + " added to your wallet.",
      type: "deposit",
      timestamp: new Date().toISOString(),
      read: false
    };
    firebasePush("notifications/" + userId, notification);
    
    Logger.log("Wallet credited successfully for User: " + userId + " Amount: " + amount);
    return jsonResponse({ received: true, message: "Wallet updated" });
  }
  
  return jsonResponse({ received: true, message: "Payment already processed or not found" });
}

// --- PART 3: FIREBASE REST API HELPERS (REST Protocol: .json?auth=) ---

function firebaseGet(path) {
  const url = FIREBASE_DB_URL + path + ".json?auth=" + FIREBASE_SECRET;
  const response = UrlFetchApp.fetch(url);
  return JSON.parse(response.getContentText());
}

function firebasePut(path, data) {
  const url = FIREBASE_DB_URL + path + ".json?auth=" + FIREBASE_SECRET;
  const options = {
    method: "put",
    contentType: "application/json",
    payload: JSON.stringify(data)
  };
  UrlFetchApp.fetch(url, options);
}

function firebasePatch(path, data) {
  const url = FIREBASE_DB_URL + path + ".json?auth=" + FIREBASE_SECRET;
  const options = {
    method: "patch",
    contentType: "application/json",
    payload: JSON.stringify(data)
  };
  UrlFetchApp.fetch(url, options);
}

function firebasePush(path, data) {
  const url = FIREBASE_DB_URL + path + ".json?auth=" + FIREBASE_SECRET;
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(data)
  };
  UrlFetchApp.fetch(url, options);
}

/**
 * Requirement: Fetch current balance, add amount, and use PATCH
 */
function updateUserBalance(userId, amount) {
  const userPath = "users/" + userId;
  const userData = firebaseGet(userPath);
  
  const currentBalance = (userData && userData.balance) ? Number(userData.balance) : 0;
  const newBalance = currentBalance + amount;
  
  firebasePatch(userPath, { balance: newBalance });
  Logger.log("User " + userId + " balance updated: " + currentBalance + " -> " + newBalance);
}

/**
 * Requirement: Every collect-money request MUST have a unique reference in UUID v4 format
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Requirement: Always return responses using ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON)
 */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
