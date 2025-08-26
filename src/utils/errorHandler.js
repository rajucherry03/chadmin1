/**
 * Error Handling Utility
 * 
 * This utility provides centralized error handling for the application,
 * including Firebase errors, CSP violations, and other common issues.
 */

// Error types
export const ERROR_TYPES = {
  FIREBASE_AUTH: 'FIREBASE_AUTH',
  FIREBASE_FIRESTORE: 'FIREBASE_FIRESTORE',
  FIREBASE_ANALYTICS: 'FIREBASE_ANALYTICS',
  CSP_VIOLATION: 'CSP_VIOLATION',
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  UNKNOWN: 'UNKNOWN'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Handle Firebase Analytics errors gracefully
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 */
export const handleFirebaseAnalyticsError = (error, context = '') => {
  const errorInfo = {
    type: ERROR_TYPES.FIREBASE_ANALYTICS,
    severity: ERROR_SEVERITY.LOW,
    message: error.message,
    context,
    timestamp: new Date().toISOString()
  };

  // Log error for debugging
  console.warn('Firebase Analytics Error:', errorInfo);
  
  // Analytics errors are non-critical, so we don't throw
  return errorInfo;
};

/**
 * Handle CSP violations
 * @param {string} directive - The CSP directive that was violated
 * @param {string} blockedURI - The URI that was blocked
 */
export const handleCSPViolation = (directive, blockedURI) => {
  const errorInfo = {
    type: ERROR_TYPES.CSP_VIOLATION,
    severity: ERROR_SEVERITY.MEDIUM,
    message: `CSP violation: ${directive} blocked ${blockedURI}`,
    directive,
    blockedURI,
    timestamp: new Date().toISOString()
  };

  console.warn('CSP Violation:', errorInfo);
  
  // For development, provide helpful suggestions
  if (process.env.NODE_ENV === 'development') {
    console.info('To fix CSP violations, update the Content Security Policy in index.html');
  }
  
  return errorInfo;
};

/**
 * Handle Firebase authentication errors
 * @param {Error} error - The Firebase auth error
 * @param {string} context - Context where the error occurred
 */
export const handleFirebaseAuthError = (error, context = '') => {
  const errorInfo = {
    type: ERROR_TYPES.FIREBASE_AUTH,
    severity: ERROR_SEVERITY.HIGH,
    message: error.message,
    code: error.code,
    context,
    timestamp: new Date().toISOString()
  };

  console.error('Firebase Auth Error:', errorInfo);
  
  // Re-throw auth errors as they are critical
  throw error;
};

/**
 * Handle Firestore errors
 * @param {Error} error - The Firestore error
 * @param {string} context - Context where the error occurred
 */
export const handleFirestoreError = (error, context = '') => {
  const errorInfo = {
    type: ERROR_TYPES.FIREBASE_FIRESTORE,
    severity: ERROR_SEVERITY.HIGH,
    message: error.message,
    code: error.code,
    context,
    timestamp: new Date().toISOString()
  };

  console.error('Firestore Error:', errorInfo);
  
  // Handle specific Firestore error types
  if (error.code === 'failed-precondition') {
    console.warn('Index required for this query. Consider creating the required index or using client-side sorting.');
    // Don't re-throw index errors as they can be handled gracefully
    return errorInfo;
  } else if (error.code === 'unimplemented') {
    console.warn('Query not supported. Consider using a different approach.');
    return errorInfo;
  }
  
  // Re-throw other Firestore errors as they are critical
  throw error;
};

/**
 * Generic error handler
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 * @param {string} type - Error type
 */
export const handleError = (error, context = '', type = ERROR_TYPES.UNKNOWN) => {
  const errorInfo = {
    type,
    severity: ERROR_SEVERITY.MEDIUM,
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  };

  console.error('Application Error:', errorInfo);
  
  // For critical errors, re-throw
  if (type === ERROR_TYPES.FIREBASE_AUTH || type === ERROR_TYPES.FIREBASE_FIRESTORE) {
    throw error;
  }
  
  return errorInfo;
};

/**
 * Setup global error handlers
 */
export const setupGlobalErrorHandlers = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
    event.preventDefault();
  });

  // Handle CSP violations
  document.addEventListener('securitypolicyviolation', (event) => {
    handleCSPViolation(event.violatedDirective, event.blockedURI);
  });

  // Handle general errors
  window.addEventListener('error', (event) => {
    handleError(event.error, 'Global Error Handler');
  });
};

/**
 * Check if Firebase Analytics is available
 * @returns {boolean} True if analytics is available
 */
export const isAnalyticsAvailable = () => {
  try {
    return typeof window !== 'undefined' && 
           window.gtag && 
           typeof window.gtag === 'function';
  } catch (error) {
    return false;
  }
};

/**
 * Safe analytics call
 * @param {string} eventName - The analytics event name
 * @param {Object} parameters - Event parameters
 */
export const safeAnalyticsCall = (eventName, parameters = {}) => {
  if (!isAnalyticsAvailable()) {
    console.warn('Analytics not available for event:', eventName);
    return;
  }

  try {
    window.gtag('event', eventName, parameters);
  } catch (error) {
    handleFirebaseAnalyticsError(error, `Analytics event: ${eventName}`);
  }
};

// Error Handler Utility for Firebase Connectivity Issues

export class FirebaseErrorHandler {
  static isConnectivityError(error) {
    const connectivityErrors = [
      'ERR_INTERNET_DISCONNECTED',
      'ERR_NETWORK',
      'ERR_CONNECTION_REFUSED',
      'ERR_CONNECTION_TIMED_OUT',
      'ERR_NAME_NOT_RESOLVED',
      'unavailable',
      'network-request-failed'
    ];
    
    return connectivityErrors.some(errType => 
      error.message?.includes(errType) || 
      error.code?.includes(errType) ||
      error.toString().includes(errType)
    );
  }

  static isFirestoreError(error) {
    return error.code?.startsWith('firestore/') || 
           error.message?.includes('Firestore') ||
           error.message?.includes('collection reference');
  }

  static isAuthError(error) {
    return error.code?.startsWith('auth/') || 
           error.message?.includes('Authentication');
  }

  static getErrorMessage(error) {
    if (this.isConnectivityError(error)) {
      return {
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        type: 'connectivity',
        action: 'retry'
      };
    }

    if (this.isFirestoreError(error)) {
      if (error.message?.includes('collection reference')) {
        return {
          title: 'Data Structure Error',
          message: 'There was an issue with the data structure. Please contact support.',
          type: 'structure',
          action: 'contact_support'
        };
      }
      return {
        title: 'Database Error',
        message: 'Unable to access the database. Please try again later.',
        type: 'database',
        action: 'retry'
      };
    }

    if (this.isAuthError(error)) {
      return {
        title: 'Authentication Error',
        message: 'Please log in again to continue.',
        type: 'auth',
        action: 'login'
      };
    }

    return {
      title: 'Unexpected Error',
      message: 'An unexpected error occurred. Please try again.',
      type: 'unknown',
      action: 'retry'
    };
  }

  static async handleError(error, context = '') {
    const errorInfo = this.getErrorMessage(error);
    
    console.error(`[${context}] Error:`, error);
    console.error(`[${context}] Error Info:`, errorInfo);

    // Log to analytics or monitoring service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'error', {
        event_category: 'firebase_error',
        event_label: errorInfo.type,
        value: 1
      });
    }

    return errorInfo;
  }

  static showUserFriendlyError(errorInfo) {
    // You can customize this to show different UI components
    const message = `${errorInfo.title}: ${errorInfo.message}`;
    
    if (errorInfo.type === 'connectivity') {
      // Show offline indicator
      this.showOfflineIndicator();
    }
    
    // Show toast or alert
    if (typeof window !== 'undefined') {
      // You can integrate with your preferred toast library
      alert(message);
    }
  }

  static showOfflineIndicator() {
    if (typeof window !== 'undefined') {
      // Create or update offline indicator
      let indicator = document.getElementById('offline-indicator');
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'offline-indicator';
        indicator.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #ef4444;
          color: white;
          text-align: center;
          padding: 8px;
          z-index: 9999;
          font-size: 14px;
        `;
        document.body.appendChild(indicator);
      }
      indicator.textContent = '⚠️ You are currently offline. Some features may not work properly.';
      indicator.style.display = 'block';
    }
  }

  static hideOfflineIndicator() {
    if (typeof window !== 'undefined') {
      const indicator = document.getElementById('offline-indicator');
      if (indicator) {
        indicator.style.display = 'none';
      }
    }
  }

  static async retryOperation(operation, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        
        if (this.isConnectivityError(error)) {
          console.log(`Attempt ${attempt} failed due to connectivity. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        } else {
          throw error; // Don't retry non-connectivity errors
        }
      }
    }
  }
}

// Network connectivity monitor
export class NetworkMonitor {
  static init() {
    if (typeof window !== 'undefined') {
      let reconnectAttempts = 0;
      const maxReconnectAttempts = 5;
      
      window.addEventListener('online', () => {
        FirebaseErrorHandler.hideOfflineIndicator();
        console.log('Network connection restored');
        reconnectAttempts = 0; // Reset attempts on successful connection
        
        // Re-enable Firestore network
        import('../firebase.js').then(({ firestoreNetworkManager }) => {
          firestoreNetworkManager.enableNetwork();
        }).catch(console.warn);
      });

      window.addEventListener('offline', () => {
        FirebaseErrorHandler.showOfflineIndicator();
        console.log('Network connection lost');
        
        // Disable Firestore network to prevent connection errors
        import('../firebase.js').then(({ firestoreNetworkManager }) => {
          firestoreNetworkManager.disableNetwork();
        }).catch(console.warn);
      });

      // Check initial state
      if (!navigator.onLine) {
        FirebaseErrorHandler.showOfflineIndicator();
      }
      
      // Monitor for specific Firebase connection errors
      const originalConsoleError = console.error;
      console.error = (...args) => {
        const message = args.join(' ');
        
        // Filter out common Firebase connection errors to reduce noise
        if (message.includes('ERR_INTERNET_DISCONNECTED') || 
            message.includes('WebChannelConnection RPC') ||
            message.includes('transport errored')) {
          // Only log these errors once per session to reduce noise
          if (!window.firebaseConnectionErrorLogged) {
            console.warn('Firebase connection issue detected. Working in offline mode.');
            window.firebaseConnectionErrorLogged = true;
          }
          return;
        }
        
        // Log other errors normally
        originalConsoleError.apply(console, args);
      };
    }
  }

  static isOnline() {
    return typeof navigator !== 'undefined' && navigator.onLine;
  }
}

// Initialize network monitor
if (typeof window !== 'undefined') {
  NetworkMonitor.init();
}

export default {
  handleFirebaseAnalyticsError,
  handleCSPViolation,
  handleFirebaseAuthError,
  handleFirestoreError,
  handleError,
  setupGlobalErrorHandlers,
  isAnalyticsAvailable,
  safeAnalyticsCall,
  ERROR_TYPES,
  ERROR_SEVERITY
};
