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


