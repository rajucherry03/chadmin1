// Import the functions you need from the SDKs you need
import { initializeApp, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, initializeFirestore, enableNetwork, disableNetwork } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { handleFirebaseAnalyticsError } from "./utils/errorHandler.js";

const firebaseConfig = {
  apiKey: "AIzaSyA0U_p8Zi4OQ14JwC5xvU7C0m3IxJ1bCZ8",
  authDomain: "ch360-ds-erp.firebaseapp.com",
  projectId: "ch360-ds-erp",
  storageBucket: "ch360-ds-erp.firebasestorage.app",
  messagingSenderId: "534259169903",
  appId: "1:534259169903:web:6f8cb4ebb2e2128ac12b9a",
  measurementId: "G-2FWQFRNZJ2"
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

// Initialize Firestore with improved offline configuration
export const db = initializeFirestore(app, {
  cacheSizeBytes: 100 * 1024 * 1024, // Increased to 100MB for better offline support
  experimentalForceLongPolling: true, // Better for some network conditions
  useFetchStreams: false, // Disable fetch streams for better compatibility
});

// Network connectivity management
export const firestoreNetworkManager = {
  async enableNetwork() {
    try {
      await enableNetwork(db);
      console.log('Firestore network enabled');
    } catch (error) {
      console.warn('Failed to enable Firestore network:', error);
    }
  },
  
  async disableNetwork() {
    try {
      await disableNetwork(db);
      console.log('Firestore network disabled');
    } catch (error) {
      console.warn('Failed to disable Firestore network:', error);
    }
  }
};

export const auth = getAuth(app);
export const storage = getStorage(app);
export { analytics };

// Secondary app/auth for background user creation (prevents switching current session)
let workerApp = null;
try {
  workerApp = getApp('worker');
} catch (_) {
  try {
    workerApp = initializeApp(firebaseConfig, 'worker');
  } catch (e) {
    // If something goes wrong, fall back to primary app (will switch session on create)
    workerApp = app;
  }
}

export const workerAuth = getAuth(workerApp);