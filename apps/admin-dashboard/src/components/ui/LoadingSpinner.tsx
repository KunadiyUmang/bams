import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
  color?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-7 h-7 border-2',
  lg: 'w-12 h-12 border-3',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  label,
  color = 'border-blue-600 border-t-transparent',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full animate-spin ${color}`}
        role="status"
        aria-label="Loading"
      />
      {label && <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>}
    </div>
  );
};

export default LoadingSpinner;
