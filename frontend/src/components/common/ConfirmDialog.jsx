import React from 'react';
import './ConfirmDialog.css';

const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = '确认', 
  cancelText = '取消',
  type = 'danger' // danger, warning, info
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  const getTypeClass = () => {
    switch (type) {
      case 'danger':
        return 'confirm-dialog--danger';
      case 'warning':
        return 'confirm-dialog--warning';
      case 'info':
        return 'confirm-dialog--info';
      default:
        return '';
    }
  };

  return (
    <div className="confirm-dialog-overlay">
      <div className={`confirm-dialog ${getTypeClass()}`}>
        <div className="confirm-dialog-header">
          <h3 className="confirm-dialog-title">{title}</h3>
        </div>
        <div className="confirm-dialog-body">
          <p className="confirm-dialog-message">{message}</p>
        </div>
        <div className="confirm-dialog-footer">
          <button 
            className="confirm-dialog-btn confirm-dialog-btn--cancel"
            onClick={handleCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-dialog-btn confirm-dialog-btn--confirm confirm-dialog-btn--${type}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
