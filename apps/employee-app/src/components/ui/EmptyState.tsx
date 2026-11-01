'use client';

import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className = '',
}) => {
  return (
    <div
      className={`bams-card ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 20px',
        textAlign: 'center',
        borderStyle: 'dashed',
        backgroundColor: 'var(--bg-card-subtle)',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'rgba(37, 99, 235, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          color: 'var(--color-secondary)',
        }}
      >
        {icon || (
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="9" y1="13" x2="15" y2="13" />
            <line x1="9" y1="17" x2="13" y2="17" />
          </svg>
        )}
      </div>

      <h3
        style={{
          fontSize: '1.05rem',
          fontWeight: 600,
          marginBottom: '6px',
          color: 'var(--text-main)',
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            maxWidth: '280px',
            marginBottom: actionLabel ? '16px' : '0',
          }}
        >
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn btn-primary btn-sm"
          style={{ marginTop: '8px' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
