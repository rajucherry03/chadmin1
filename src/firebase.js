// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { handleFirebaseAnalyticsError } from "./utils/errorHandler.js";

const firebaseConfig = {
  apiKey: "AIzaSyBwJExOpia7I5rcumlxet9l8_0UqMEQD9w",
  authDomain: "ch360-erp.firebaseapp.com",
  projectId: "ch360-erp",
  storageBucket: "ch360-erp.firebasestorage.app",
  messagingSenderId: "845970812719",
  appId: "1:845970812719:web:36957be1c3d408a221fbda",
  measurementId: "G-R6NWHNY4BN"
};

const app = initializeApp(firebaseConfig);

// Analytics (guarded with better error handling)
let analytics = null;
try { 
  analytics = getAnalytics(app); 
} catch (error) {
  handleFirebaseAnalyticsError(error, 'Firebase Analytics initialization');
  // Analytics will fall back to local config
}

// Initialize Firestore with cache configuration (replaces enableIndexedDbPersistence)
export const db = initializeFirestore(app, {
  cacheSizeBytes: 50 * 1024 * 1024, // 50MB cache size
  experimentalForceLongPolling: true, // Better for some network conditions
});

export const auth = getAuth(app);
export const storage = getStorage(app);
export { analytics };