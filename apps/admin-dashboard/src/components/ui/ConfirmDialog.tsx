'use client';

import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const iconConfig = {
    danger: {
      icon: <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
      bg: 'bg-rose-100 dark:bg-rose-950/50',
      btnVariant: 'danger' as const,
    },
    warning: {
      icon: <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      bg: 'bg-amber-100 dark:bg-amber-950/50',
      btnVariant: 'secondary' as const,
    },
    info: {
      icon: <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      bg: 'bg-blue-100 dark:bg-blue-950/50',
      btnVariant: 'primary' as const,
    },
  }[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title=""
      size="sm"
      footer={
        <>
          <Button variant="outline" size="md" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={iconConfig.btnVariant}
            size="md"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4 pt-1">
        <div className={`p-3 rounded-full shrink-0 ${iconConfig.bg}`}>{iconConfig.icon}</div>
        <div>
          <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5">{title}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
