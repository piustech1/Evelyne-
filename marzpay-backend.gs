/**
 * EASYBOOST PAYMENT BACKEND (Google Apps Script)
 * 
 * Instructions:
 * 1. Replace the constants below with your actual credentials.
 * 2. Deploy as a Web App:
 *    - Click "Deploy" > "New Deployment"
 *    - Select "Web App"
 *    - Set "Execute as" to "Me"
 *    - Set "Who has access" to "Anyone"
 * 3. Copy the Web App URL and use it in your frontend and MarzPay dashboard.
 */

// --- CONFIGURATION ---
const MARZPAY_API_KEY = "YOUR_MARZPAY_API_KEY";
const MARZPAY_API_SECRET = "YOUR_MARZPAY_API_SECRET";
const FIREBASE_DB_URL = "https://your-project-id.firebaseio.com/"; // Include trailing slash

/**
 * Main entry point for POST requests
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
  const { phone, amount, userId, userEmail } = data;
  
  if (!phone || !amount || !userId) {
    return jsonResponse({ success: false, message: "Missing required fields (phone, amount, userId)" });
  }
  
  // Generate unique reference
  const reference = "txn_" + new Date().getTime();
  Logger.log("Initiating Payment Request. Ref: " + reference);
  
  // 1. Save pending payment to Firebase
  const paymentData = {
    reference: reference,
    userId: userId,
    userEmail: userEmail || "",
    amount: Number(amount),
    phone: phone,
    status: "pending",
    createdAt: new Date().toISOString(),
    source: "GoogleAppsScript"
  };
  
  firebasePut("payments/" + reference, paymentData);
  
  // 2. Call MarzPay API
  const auth = Utilities.base64Encode(MARZPAY_API_KEY + ":" + MARZPAY_API_SECRET);
  const payload = {
    amount: Math.floor(Number(amount)),
    phone_number: phone,
    country: "UG",
    reference: reference,
    description: "Wallet Top-up",
    callback_url: ScriptApp.getService().getUrl() // Automatically uses this script's URL
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
  
  if (!transaction || payload.event_type !== "collection.completed") {
    return jsonResponse({ received: true, message: "Ignored event type" });
  }
  
  const reference = transaction.reference;
  const status = transaction.status;
  
  if (status !== "completed") {
    return jsonResponse({ received: true, message: "Transaction status not completed" });
  }
  
  // 1. Fetch Payment Record from Firebase
  const payment = firebaseGet("payments/" + reference);
  
  if (payment && (payment.status === "pending" || payment.status === "Pending")) {
    const userId = payment.userId;
    const amount = Number(transaction.amount.raw || transaction.amount);
    
    // 2. Update User Balance (Atomic-like fetch and patch)
    updateUserBalance(userId, amount);
    
    // 3. Update Payment Status to Successful
    firebasePatch("payments/" + reference, {
      status: "Successful",
      completedAt: new Date().toISOString(),
      provider: transaction.provider || "MarzPay"
    });
    
    // 4. Create Notification for User
    const notification = {
      message: "Deposit successful! UGX " + amount.toLocaleString() + " added to your wallet.",
      type: "deposit",
      timestamp: new Date().toISOString(),
      read: false
    };
    firebasePush("notifications/" + userId, notification);
    
    Logger.log("Wallet credited successfully for User: " + userId);
    return jsonResponse({ received: true, message: "Wallet updated" });
  }
  
  return jsonResponse({ received: true, message: "Payment already processed or not found" });
}

// --- PART 3: FIREBASE REST API HELPERS ---

function firebaseGet(path) {
  const url = FIREBASE_DB_URL + path + ".json";
  const response = UrlFetchApp.fetch(url);
  return JSON.parse(response.getContentText());
}

function firebasePut(path, data) {
  const url = FIREBASE_DB_URL + path + ".json";
  const options = {
    method: "put",
    contentType: "application/json",
    payload: JSON.stringify(data)
  };
  UrlFetchApp.fetch(url, options);
}

function firebasePatch(path, data) {
  const url = FIREBASE_DB_URL + path + ".json";
  const options = {
    method: "patch",
    contentType: "application/json",
    payload: JSON.stringify(data)
  };
  UrlFetchApp.fetch(url, options);
}

function firebasePush(path, data) {
  const url = FIREBASE_DB_URL + path + ".json";
  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(data)
  };
  UrlFetchApp.fetch(url, options);
}

/**
 * Atomic-like balance update
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
 * PART 4: Helper to return JSON responses
 */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
