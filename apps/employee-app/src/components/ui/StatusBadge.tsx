'use client';

import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { TransactionStatus } from '@/types';
import { useLanguageStore } from '@/store/language.store';

interface StatusBadgeProps {
  status: TransactionStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const { t } = useLanguageStore();

  const config = {
    PENDING: {
      label: t('status.Pending') || 'Pending',
      className: 'badge-pending',
      icon: Clock,
      color: 'var(--color-warning-dark)',
    },
    APPROVED: {
      label: t('status.Approved') || 'Approved',
      className: 'badge-approved',
      icon: CheckCircle2,
      color: 'var(--color-success-dark)',
    },
    REJECTED: {
      label: t('status.Rejected') || 'Rejected',
      className: 'badge-rejected',
      icon: XCircle,
      color: 'var(--color-danger-dark)',
    },
  }[status] || {
    label: status,
    className: 'badge-neutral',
    icon: Clock,
    color: 'var(--text-muted)',
  };

  const Icon = config.icon;
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={`badge ${config.className} ${className}`}
      style={{
        padding: size === 'sm' ? '3px 8px' : '5px 10px',
        fontSize: size === 'sm' ? '0.725rem' : '0.8rem',
      }}
    >
      <Icon size={iconSize} strokeWidth={2.5} />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
