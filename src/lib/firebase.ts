import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDQowFz4CyV4KaU2snaaEog99pWHSlaYtw",
  authDomain: "easyboost-f6ac5.firebaseapp.com",
  databaseURL: "https://easyboost-f6ac5-default-rtdb.firebaseio.com",
  projectId: "easyboost-f6ac5",
  storageBucket: "easyboost-f6ac5.firebasestorage.app",
  messagingSenderId: "363188338779",
  appId: "1:363188338779:web:bb5b264ea2c0a81b0b7f7e"
};

let app;
let auth: any = null;
let db: any = null;
let messaging: any = null;
let analytics: any = null;
const googleProvider = new GoogleAuthProvider();

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getDatabase(app);
  
  if (typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app);
    } catch (e) {
      console.warn("Firebase Analytics failed to initialize:", e);
    }

    try {
      messaging = getMessaging(app);
    } catch (e) {
      console.warn("Firebase Messaging failed to initialize:", e);
    }
  }
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export { app, auth, db, messaging, googleProvider, analytics };
