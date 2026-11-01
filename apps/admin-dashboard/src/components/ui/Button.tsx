import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#142B4A] hover:bg-[#0F2137] text-white shadow-sm border border-transparent focus:ring-2 focus:ring-[#142B4A]/40 dark:bg-blue-600 dark:hover:bg-blue-700',
  secondary:
    'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm border border-transparent focus:ring-2 focus:ring-blue-500/40',
  outline:
    'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 focus:ring-2 focus:ring-slate-400/30',
  danger:
    'bg-rose-600 hover:bg-rose-700 text-white shadow-sm border border-transparent focus:ring-2 focus:ring-rose-500/40',
  success:
    'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border border-transparent focus:ring-2 focus:ring-emerald-500/40',
  ghost:
    'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-slate-400/20',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs rounded-md gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-5 py-2.5 text-base rounded-lg gap-2.5',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center font-medium transition-colors duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none ${
          variantStyles[variant]
        } ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" color="border-current border-t-transparent" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
