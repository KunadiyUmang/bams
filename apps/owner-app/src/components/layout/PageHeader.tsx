'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  className = '',
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div
      className={`sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <button
              onClick={handleBack}
              aria-label="Go back"
              className="p-1.5 -ml-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {rightAction && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {rightAction}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageHeader;
