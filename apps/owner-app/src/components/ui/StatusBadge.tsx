'use client';

import React from 'react';
import { TransactionStatus } from '@/types';
import { useLanguageStore } from '@/store/language.store';

interface StatusBadgeProps {
  status: TransactionStatus | 'ACTIVE' | 'INACTIVE' | string;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
  const t = useLanguageStore((state) => state.t);

  const normalized = (status || '').toUpperCase();

  let label = normalized;
  let bgClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

  if (normalized === TransactionStatus.PENDING) {
    label = t('transactions.pending', 'Pending');
    bgClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
  } else if (normalized === TransactionStatus.APPROVED || normalized === 'ACTIVE') {
    label = normalized === 'ACTIVE' ? t('employees.active', 'Active') : t('transactions.approved', 'Approved');
    bgClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
  } else if (normalized === TransactionStatus.REJECTED || normalized === 'INACTIVE') {
    label = normalized === 'INACTIVE' ? t('employees.inactive', 'Inactive') : t('transactions.rejected', 'Rejected');
    bgClass = 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
  }

  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full tracking-wide ${sizeClasses} ${bgClass} ${className}`}
    >
      {label}
    </span>
  );
}

export default StatusBadge;
