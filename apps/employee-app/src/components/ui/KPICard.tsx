'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export type KPIVariant = 'income' | 'expense' | 'profit' | 'balance';

interface KPICardProps {
  label: string;
  value: number;
  icon?: React.ReactNode;
  trend?: number; // e.g. +12 or -5 percent
  variant?: KPIVariant;
  currency?: string;
  className?: string;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  icon,
  trend,
  variant = 'balance',
  currency = '₹',
  className = '',
  onClick,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);

  // Animated number count-up on mount
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 800; // ms
    const startValue = 0;
    const endValue = value;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo curve
      const easedProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(startValue + (endValue - startValue) * easedProgress);
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value]);

  const formattedAmount = `${currency}${Math.abs(displayValue).toLocaleString('en-IN')}`;

  const variantClass = `kpi-${variant}`;

  return (
    <div
      onClick={onClick}
      className={`kpi-card ${variantClass} ${className}`}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        minHeight: '110px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {label}
        </span>
        {icon && (
          <div
            style={{
              padding: '6px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-card-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginTop: 'auto',
        }}
      >
        <span
          style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            color:
              variant === 'income'
                ? 'var(--color-success)'
                : variant === 'expense'
                ? 'var(--color-danger)'
                : 'var(--text-main)',
            letterSpacing: '-0.02em',
          }}
        >
          {displayValue < 0 ? '-' : ''}{formattedAmount}
        </span>

        {typeof trend === 'number' && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              gap: '2px',
              color: trend >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
              backgroundColor: trend >= 0 ? 'var(--color-success-light)' : 'var(--color-danger-light)',
              padding: '2px 6px',
              borderRadius: '12px',
            }}
          >
            {trend >= 0 ? (
              <ArrowUpRight size={13} strokeWidth={2.5} />
            ) : (
              <ArrowDownRight size={13} strokeWidth={2.5} />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default KPICard;
