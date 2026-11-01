'use client';

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label,
  className = '',
}) => {
  const pixelSizes = {
    sm: 20,
    md: 32,
    lg: 48,
  };

  const px = pixelSizes[size] || 32;

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}
    >
      <div
        style={{
          width: `${px}px`,
          height: `${px}px`,
          border: `${Math.max(2, Math.round(px / 8))}px solid rgba(37, 99, 235, 0.15)`,
          borderTopColor: '#2563EB',
          borderRightColor: '#142B4A',
          borderRadius: '50%',
          animation: 'bams-spin 0.8s linear infinite',
        }}
      />
      {label && (
        <span
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          {label}
        </span>
      )}
      <style jsx>{`
        @keyframes bams-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
