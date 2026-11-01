'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  className = '',
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header
      className={`glass-header ${className}`}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
        padding: '12px 16px',
        paddingTop: 'calc(var(--safe-top) + 12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back"
            className="btn btn-ghost"
            style={{
              padding: '6px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeft size={22} />
          </button>
        )}
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                lineHeight: 1.2,
                marginTop: '2px',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {rightAction && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {rightAction}
        </div>
      )}
    </header>
  );
};

export default PageHeader;
