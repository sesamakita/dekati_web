// src/components/CustomDialog.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import { 
  AlertTriangle, 
  HelpCircle, 
  CheckCircle2, 
  Info, 
  X,
  Trash2,
  LogOut
} from 'lucide-react';

export type DialogType = 'warning' | 'confirm' | 'success' | 'info' | 'danger';

export interface CustomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
}

export const CustomDialog: React.FC<CustomDialogProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'Mengerti',
  cancelText = 'Batal',
  onConfirm,
  showCancel = false,
}) => {
  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const getIconAndStyle = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <Trash2 className="w-6 h-6 text-rose-600" />,
          bgIcon: 'bg-rose-50 border-rose-200 text-rose-600',
          btnConfirm: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20',
          borderTop: 'border-t-rose-500',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
          bgIcon: 'bg-amber-50 border-amber-200 text-amber-600',
          btnConfirm: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20',
          borderTop: 'border-t-amber-500',
        };
      case 'confirm':
        return {
          icon: <HelpCircle className="w-6 h-6 text-emerald-600" />,
          bgIcon: 'bg-emerald-50 border-emerald-200 text-emerald-600',
          btnConfirm: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
          borderTop: 'border-t-emerald-500',
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
          bgIcon: 'bg-emerald-50 border-emerald-200 text-emerald-600',
          btnConfirm: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20',
          borderTop: 'border-t-emerald-500',
        };
      default:
        return {
          icon: <Info className="w-6 h-6 text-sky-600" />,
          bgIcon: 'bg-sky-50 border-sky-200 text-sky-600',
          btnConfirm: 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20',
          borderTop: 'border-t-sky-500',
        };
    }
  };

  const style = getIconAndStyle();

  return createPortal(
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full my-auto flex flex-col overflow-hidden border border-slate-200/80 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Content Body */}
        <div className="p-6 text-center">
          <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border shadow-sm mb-4 ${style.bgIcon}`}>
            {style.icon}
          </div>

          <h3 className="text-base font-bold text-slate-900 tracking-tight mb-2">
            {title}
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed font-medium mb-6">
            {message}
          </p>

          {/* Action Buttons */}
          <div className={`flex items-center gap-2.5 ${showCancel ? 'justify-between' : 'justify-center'}`}>
            {showCancel && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200/90 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                {cancelText}
              </button>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold shadow-md transition-all ${style.btnConfirm}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
