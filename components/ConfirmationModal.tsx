import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText = "Yes",
  cancelText = "No"
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity" 
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6 m-4" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        <div className="text-slate-300 mb-6">{message}</div>
        <div className="flex justify-end gap-4">
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 transition-colors font-semibold"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition-colors font-semibold text-white"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;