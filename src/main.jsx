import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { performanceMonitor } from './utils/performanceMonitor.jsx';

// Initialize performance monitoring
performanceMonitor.observeCoreWebVitals();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register PWA service worker only in production to avoid dev caching issues
if (import.meta.env && import.meta.env.PROD) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true });
  });
}


