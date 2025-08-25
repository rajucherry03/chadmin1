import React from "react";

export const Notice = ({ type = "info", message, onClose }) => {
  if (!message) return null;
  const styles = type === 'error'
    ? 'bg-red-50 text-red-700 border-red-200'
    : type === 'success'
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-blue-50 text-blue-700 border-blue-200';
  return (
    <div className={`border ${styles} rounded-lg px-3 py-2 flex items-start justify-between`}>
      <div className="text-sm">{message}</div>
      {onClose && <button className="ml-4 text-xs opacity-70 hover:opacity-100" onClick={onClose}>Close</button>}
    </div>
  );
};

export const Spinner = ({ size = 'sm' }) => {
  const dims = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
  return <div className={`inline-block ${dims} border-2 border-gray-300 border-t-orange-600 rounded-full animate-spin`} />;
};

// Form controls
const baseInput = "w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition";

export const Field = ({ label, children, hint, error }) => (
  <div className="space-y-1">
    {label && <label className="text-sm text-gray-700">{label}</label>}
    {children}
    {hint && !error && <div className="text-xs text-gray-500">{hint}</div>}
    {error && <div className="text-xs text-red-600">{error}</div>}
  </div>
);

export const TextInput = (props) => (
  <input {...props} className={`${baseInput} ${props.className||''}`} />
);

export const NumberInput = (props) => (
  <input type="number" {...props} className={`${baseInput} ${props.className||''}`} />
);

export const Select = ({ children, className, ...rest }) => (
  <select {...rest} className={`${baseInput} ${className||''}`}>
    {children}
  </select>
);

export const TextArea = (props) => (
  <textarea {...props} className={`${baseInput} ${props.className||''}`} />
);


