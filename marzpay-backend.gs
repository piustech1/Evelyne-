/**
 * EASYBOOST PAYMENT BACKEND (Google Apps Script)
 * Updated for MarzPay 2026 API Specifications
 * Developer: Piustech
 */

// --- CONFIGURATION ---
const MARZPAY_API_KEY = "marz_xmeCqRz0rGEme73o";
const MARZPAY_API_SECRET = "JN7T30E2vZquBUbLZyxlZRzAhKAyJW4B";
const FIREBASE_DB_URL = "https://easyboost-f6ac5-default-rtdb.firebaseio.com/"; // Must have trailing slash
const FIREBASE_AUTH = "bqvL37nBIPlxBBBm4CiesQIQJhNihnI6o7u9gzw0"; // Get from Project Settings > Service Accounts > Database Secrets

/**
 * Main entry point for POST requests from Frontend & MarzPay Webhooks
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    Logger.log("Incoming JSON: " + JSON.stringify(postData));
    
    // Check if it's a MarzPay Webhook (Documentation says look for event_type)
    if (postData.event_type) {
      return handleWebhook(postData);
    }
    
    // Otherwise, treat as Frontend Payment Initiation
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
 * PART 1: Handle Payment Initiation
 * Based on MarzPay "Create Collection" Docs
 */
function handlePaymentRequest(data) {
  const { phone, amount, userId, userEmail, method } = data;
  
  if (!amount || !userId) {
    return jsonResponse({ success: false, message: "Missing required fields (amount, userId)" });
  }

  const isCard = method === 'card';
  
  if (!isCard && !phone) {
    return jsonResponse({ success: false, message: "Phone number is required for mobile money" });
  }
  
  // DOCUMENTATION REQUIREMENT: "Must be in UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
  const reference = Utilities.getUuid(); 
  Logger.log("New Collection Reference: " + reference + " Method: " + method);
  
  // 1. Save record to Firebase (so we know who to credit later)
  const paymentData = {
    reference: reference,
    userId: userId,
    userEmail: userEmail || "",
    amount: Number(amount),
    phone: phone || "CARD",
    method: method || "mobile_money",
    status: "pending",
    createdAt: new Date().toISOString(),
    source: "Vercel-Frontend"
  };
  
  firebasePut("payments/" + reference, paymentData);
  
  // 2. Prepare MarzPay Request
  const authCredentials = Utilities.base64Encode(MARZPAY_API_KEY + ":" + MARZPAY_API_SECRET);
  const payload = {
    "amount": Math.floor(Number(amount)),
    "country": "UG",
    "reference": reference, // The UUID we generated
    "description": "EasyBoost Wallet Top-up",
    "method": method || "mobile_money",
    "callback_url": ScriptApp.getService().getUrl() // The URL of this Google Script
  };

  if (!isCard) {
    payload["phone_number"] = phone;
  }
  
  const options = {
    method: "post",
    contentType: "application/json",
    headers: { "Authorization": "Basic " + authCredentials },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch("https://wallet.wearemarz.com/api/v1/collect-money", options);
  const result = JSON.parse(response.getContentText());
  
  Logger.log("MarzPay API Response: " + response.getContentText());
  
  if (response.getResponseCode() !== 200 && response.getResponseCode() !== 201) {
    return jsonResponse({ 
      success: false, 
      message: result.message || "MarzPay connection error",
      error_code: result.error_code || "UNKNOWN"
    });
  }
  
  // Success response to frontend
  const responseData = {
    success: true,
    reference: reference,
    message: isCard ? "Card collection initiated" : "Collection initiated successfully"
  };

  if (isCard && result.data && result.data.redirect_url) {
    responseData.redirectUrl = result.data.redirect_url;
  }

  return jsonResponse(responseData);
}

/**
 * PART 2: Handle Webhook Notification
 * Based on MarzPay "Webhook Payload Structure" Docs
 */
function handleWebhook(payload) {
  Logger.log("Processing Webhook: " + payload.event_type);
  
  // According to Doc: payload contains 'transaction' and 'collection' objects
  const transaction = payload.transaction;
  const collectionData = payload.collection;
  
  if (!transaction || payload.event_type !== "collection.completed") {
    return jsonResponse({ received: true, message: "Non-completion event ignored" });
  }
  
  const reference = transaction.reference;
  const status = transaction.status;
  
  if (status !== "completed") {
    Logger.log("Transaction status: " + status + ". Skipping credit.");
    return jsonResponse({ received: true });
  }
  
  // 1. Verify payment exists in our Firebase
  const paymentRecord = firebaseGet("payments/" + reference);
  
  if (paymentRecord && paymentRecord.status === "pending") {
    const userId = paymentRecord.userId;
    // DOC: "amount.raw" is the integer value
    const amountToCredit = Number(transaction.amount.raw);
    
    // 2. Perform Wallet Credit
    updateUserBalance(userId, amountToCredit);
    
    // 3. Update Payment record to prevent double-crediting
    firebasePatch("payments/" + reference, {
      status: "Successful",
      completedAt: new Date().toISOString(),
      provider_transaction_id: collectionData.provider_transaction_id || "N/A",
      provider: transaction.provider || "N/A"
    });
    
    // 4. Record Notification for the User Dashboard
    firebasePush("notifications/" + userId, {
      message: "Wallet Deposit of UGX " + amountToCredit.toLocaleString() + " successful.",
      type: "deposit",
      timestamp: new Date().toISOString(),
      read: false
    });
    
    Logger.log("Successfully credited User: " + userId);
  } else {
    Logger.log("Payment already processed or reference not found: " + reference);
  }
  
  // Documentation: "Your callback endpoint should return HTTP 200 to acknowledge receipt"
  return jsonResponse({ received: true });
}

// --- PART 3: FIREBASE CONNECTION (REST API) ---

function getFirebaseUrl(path) {
  let url = FIREBASE_DB_URL + path + ".json";
  if (FIREBASE_AUTH) {
    url += "?auth=" + FIREBASE_AUTH;
  }
  return url;
}

function firebaseGet(path) {
  const response = UrlFetchApp.fetch(getFirebaseUrl(path));
  return JSON.parse(response.getContentText());
}

function firebasePut(path, data) {
  UrlFetchApp.fetch(getFirebaseUrl(path), {
    method: "put",
    contentType: "application/json",
    payload: JSON.stringify(data)
  });
}

function firebasePatch(path, data) {
  UrlFetchApp.fetch(getFirebaseUrl(path), {
    method: "patch",
    contentType: "application/json",
    payload: JSON.stringify(data)
  });
}

function firebasePush(path, data) {
  UrlFetchApp.fetch(getFirebaseUrl(path), {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(data)
  });
}

/**
 * Update Wallet logic (Read current -> Add amount -> Write back)
 */
function updateUserBalance(userId, amount) {
  const path = "users/" + userId;
  const user = firebaseGet(path);
  
  const currentBalance = (user && user.balance) ? Number(user.balance) : 0;
  const newBalance = currentBalance + amount;
  
  firebasePatch(path, { balance: newBalance });
  Logger.log("Balance updated for " + userId + ": " + newBalance);
}

/**
 * Output JSON for both Frontend and MarzPay Webhook
 */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}