'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

export function LoadingSpinner({
  size = 24,
  className = '',
  label,
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Loader2
        size={size}
        className="animate-spin text-[#2563EB] dark:text-blue-400"
      />
      {label && (
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </span>
      )}
    </div>
  );
}

export function SkeletonLoader({
  className = '',
  rows = 3,
}: {
  className?: string;
  rows?: number;
}) {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"
        />
      ))}
    </div>
  );
}

export default LoadingSpinner;
