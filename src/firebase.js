
// Import the functions you need from the SDKs you need
import { initializeApp, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, initializeFirestore, enableNetwork, disableNetwork } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC2w0vh_kiAGXTmRDx69iMgPcqObi_-Zw0",
  authDomain: "ch360-d-erp.firebaseapp.com",
  projectId: "ch360-d-erp",
  storageBucket: "ch360-d-erp.firebasestorage.app",
  messagingSenderId: "119584645450",
  appId: "1:119584645450:web:de17d423561eb9524e61b3",
  measurementId: "G-51YTY1SYYK"
};

const app = initializeApp(firebaseConfig);

// Analytics (guarded with better error handling)
let analytics = null;
try { 
  analytics = getAnalytics(app); 
} catch (error) {
  console.warn('Firebase Analytics initialization failed:', error);
  // Analytics will fall back to local config
}

// Initialize Firestore tuned for enterprise networks/proxies and strict data handling
export const db = initializeFirestore(app, {
  cacheSizeBytes: 100 * 1024 * 1024, // 100MB cache for better resilience
  ignoreUndefinedProperties: true, // Drop undefined fields to avoid 400 Write errors
  experimentalAutoDetectLongPolling: true, // Auto-detect fallback for restricted networks
})

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