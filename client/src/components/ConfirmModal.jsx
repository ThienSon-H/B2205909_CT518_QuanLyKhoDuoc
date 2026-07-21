import React from 'react';

function ConfirmModal({ show, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, children }) {
  if (!show) return null;

  return (
    <div className="modal-custom-overlay" onClick={onCancel}>
      <div className="modal-custom-content" onClick={e => e.stopPropagation()}>
        <div className="modal-custom-header">
          <h5 className="modal-custom-title">{title || 'Xác nhận'}</h5>
          <button className="modal-custom-close ripple" onClick={onCancel}>✕</button>
        </div>
        <div className="modal-custom-body">
          {message && <p className="mb-3">{message}</p>}
          {children}
        </div>
        <div className="modal-custom-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            {cancelLabel || 'Hủy'}
          </button>
          <button className="btn btn-primary-custom ripple" onClick={onConfirm}>
            {confirmLabel || 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;