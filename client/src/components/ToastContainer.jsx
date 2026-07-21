import React from 'react';
import { useToast } from '../context/ToastContext';

const typeStyles = {
  success: { background: '#d4edda', color: '#155724', icon: '✅' },
  error: { background: '#f8d7da', color: '#721c24', icon: '❌' },
  warning: { background: '#fff3cd', color: '#856404', icon: '⚠️' },
  info: { background: '#d1ecf1', color: '#0c5460', icon: 'ℹ️' },
};

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        const style = typeStyles[toast.type] || typeStyles.info;
        return (
          <div
            key={toast.id}
            className="toast-item fade-in"
            style={{ background: style.background, color: style.color }}
            onClick={() => removeToast(toast.id)}
          >
            <span className="toast-icon">{style.icon}</span>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}>✕</button>
          </div>
        );
      })}
    </div>
  );
}

export default ToastContainer;