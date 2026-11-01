'use client';

import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  actionText,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-[#2563EB] dark:text-blue-400 mb-3 shadow-inner">
        <Icon size={28} />
      </div>

      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
        {title}
      </h3>

      {description && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
          {description}
        </p>
      )}

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-md transition-all active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
