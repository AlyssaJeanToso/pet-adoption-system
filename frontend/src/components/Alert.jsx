import React from 'react';

export default function Alert({ type = 'info', message, onClose }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type}`} role="alert">
      <span>{message}</span>
      {onClose && (
        <button type="button" className="alert-close" aria-label="Dismiss message" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
}
