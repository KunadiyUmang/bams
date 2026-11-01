'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const maxWidthClass = {
    sm: 'max-w-xs',
    md: 'max-w-sm',
    lg: 'max-w-md',
  }[maxWidth];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full ${maxWidthClass} bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10`}
          >
            {(title || description) && (
              <div className="flex items-start justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="pr-6">
                  {title && (
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <div className="p-4 max-h-[75vh] overflow-y-auto no-scrollbar">
              {children}
            </div>

            {footer && (
              <div className="flex items-center justify-end gap-2 p-3 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Modal;
