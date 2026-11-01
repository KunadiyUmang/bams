'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'var(--bg-overlay)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />

          {/* Modal Sheet Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '440px',
              maxHeight: '90vh',
              backgroundColor: 'var(--bg-card)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              boxShadow: 'var(--shadow-xl)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              zIndex: 1001,
            }}
          >
            {/* Grabber indicator */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                paddingTop: '10px',
                paddingBottom: '4px',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: 'var(--border-color)',
                }}
              />
            </div>

            {/* Header */}
            {(title || showCloseButton) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 20px',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                  }}
                >
                  {title || ''}
                </h3>
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="btn btn-ghost"
                    style={{
                      width: '34px',
                      height: '34px',
                      padding: 0,
                      borderRadius: '50%',
                    }}
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}

            {/* Content area with scrolling and safe-area inset */}
            <div
              style={{
                padding: '20px',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
                maxHeight: 'calc(90vh - 80px)',
                paddingBottom: 'calc(var(--safe-bottom) + 24px)',
              }}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
