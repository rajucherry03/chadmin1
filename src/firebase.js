// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, initializeFirestore, enableNetwork, disableNetwork } from "firebase/firestore";
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