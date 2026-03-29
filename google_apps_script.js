/**
 * SMM API Proxy Script (Dedicated for MoreThanPanel)
 * 
 * This script acts as a secure bridge between your frontend and the MoreThanPanel API.
 * It prevents "Empty response" errors often caused by Vercel's shared IP addresses.
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Go to script.google.com
 * 2. Create a new project.
 * 3. Paste this code into the editor.
 * 4. Replace 'YOUR_MTP_API_KEY' with your actual MoreThanPanel API key.
 * 5. Click "Deploy" > "New Deployment".
 * 6. Select "Web App".
 * 7. Set "Execute as" to "Me".
 * 8. Set "Who has access" to "Anyone".
 * 9. Click "Deploy" and copy the "Web App URL".
 * 10. Add this URL to your Vercel/Environment variables as VITE_SMM_GAS_URL.
 */

const API_KEY = "4185ebf986cd0eccbfccf02d8b3788a7"; // Replace with your MoreThanPanel API Key
const SMM_API_URL = "https://morethanpanel.com/api/v2";

/**
 * Handles POST requests from the frontend
 */
function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) {
      return createResponse({ error: "No data provided" });
    }

    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    
    if (!action) {
      return createResponse({ error: "No action specified" });
    }

    // Build payload for SMM API
    const payload = {
      key: API_KEY,
      action: action
    };

    // Map frontend parameters to SMM API parameters
    if (action === 'add') {
      payload.service = String(postData.service);
      payload.link = postData.link;
      payload.quantity = String(postData.quantity);
      if (postData.runs) payload.runs = String(postData.runs);
      if (postData.interval) payload.interval = String(postData.interval);
    } else if (action === 'status') {
      if (postData.orders) {
        payload.orders = String(postData.orders);
      } else {
        payload.order = String(postData.order || postData.orderId);
      }
    } else if (action === 'orders') {
      payload.action = 'status';
      payload.orders = String(postData.orders);
    } else if (action === 'refill') {
      payload.order = String(postData.order || postData.orderId);
    } else if (action === 'refill_status') {
      payload.refill = String(postData.refillId || postData.refill);
    } else if (action === 'cancel') {
      payload.orders = String(postData.orders || postData.order);
    } else if (action === 'balance') {
      // No extra params needed
    } else if (action === 'services') {
      // No extra params needed
    }

    const options = {
      method: 'post',
      payload: payload,
      muteHttpExceptions: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    const response = UrlFetchApp.fetch(SMM_API_URL, options);
    const responseText = response.getContentText();
    
    if (!responseText) {
      return createResponse({ error: "Empty response from SMM provider" });
    }

    try {
      const data = JSON.parse(responseText);
      return createResponse(data);
    } catch (parseError) {
      return createResponse({ 
        error: "Failed to parse provider response", 
        raw: responseText 
      });
    }

  } catch (error) {
    return createResponse({ error: "GAS Proxy Error: " + error.toString() });
  }
}

/**
 * Handles GET requests (optional, for testing)
 */
function doGet() {
  return ContentService.createTextOutput("SMM Proxy is active. Use POST to interact.")
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Helper to create JSON response with CORS support
 */
function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
