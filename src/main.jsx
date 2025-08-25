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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


