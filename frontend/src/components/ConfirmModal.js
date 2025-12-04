import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="confirm-title" aria-describedby="confirm-message">
        <div className="confirm-modal-header">
          <h3 id="confirm-title">{title}</h3>
          <button
            className="confirm-modal-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        <div className="confirm-modal-body">
          <p id="confirm-message">{message}</p>
        </div>
        <div className="confirm-modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            className={`btn btn-${type}`}
            onClick={onConfirm}
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
