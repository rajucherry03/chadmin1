import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { performanceMonitor } from './utils/performanceMonitor.jsx';
import { setupGlobalErrorHandlers } from './utils/errorHandler.js';

// Initialize global error handlers
setupGlobalErrorHandlers();

// Initialize performance monitoring
performanceMonitor.observeCoreWebVitals();

// Unregister any existing service workers to fix workbox navigation issues
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (let registration of registrations) {
      registration.unregister();
      console.log('Service Worker unregistered:', registration.scope);
    }
  }).catch(function(error) {
    console.error('Service Worker unregistration failed:', error);
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


