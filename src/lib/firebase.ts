import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDQowFz4CyV4KaU2snaaEog99pWHSlaYtw",
  authDomain: "easyboost-f6ac5.firebaseapp.com",
  databaseURL: "https://easyboost-f6ac5-default-rtdb.firebaseio.com",
  projectId: "easyboost-f6ac5",
  storageBucket: "easyboost-f6ac5.firebasestorage.app",
  messagingSenderId: "363188338779",
  appId: "1:363188338779:web:bb5b264ea2c0a81b0b7f7e",
  measurementId: "G-4SXSL5PYHE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
