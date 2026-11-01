'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

export type KPIVariant = 'green' | 'red' | 'blue' | 'amber' | 'navy' | 'purple';

interface KPICardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  variant?: KPIVariant;
  onClick?: () => void;
  badge?: string | number;
  className?: string;
}

const variantStyles: Record<
  KPIVariant,
  {
    bg: string;
    border: string;
    iconBg: string;
    iconColor: string;
    valueColor: string;
    badgeBg: string;
  }
> = {
  green: {
    bg: 'bg-emerald-50/70 dark:bg-emerald-950/20',
    border: 'border-emerald-200/80 dark:border-emerald-800/40',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    valueColor: 'text-emerald-700 dark:text-emerald-400',
    badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  },
  red: {
    bg: 'bg-rose-50/70 dark:bg-rose-950/20',
    border: 'border-rose-200/80 dark:border-rose-800/40',
    iconBg: 'bg-rose-100 dark:bg-rose-900/50',
    iconColor: 'text-rose-600 dark:text-rose-400',
    valueColor: 'text-rose-700 dark:text-rose-400',
    badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
  },
  blue: {
    bg: 'bg-blue-50/70 dark:bg-blue-950/20',
    border: 'border-blue-200/80 dark:border-blue-800/40',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    valueColor: 'text-blue-700 dark:text-blue-400',
    badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  amber: {
    bg: 'bg-amber-50/70 dark:bg-amber-950/20',
    border: 'border-amber-200/80 dark:border-amber-800/40',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
    valueColor: 'text-amber-700 dark:text-amber-400',
    badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  },
  navy: {
    bg: 'bg-slate-50/90 dark:bg-slate-900/60',
    border: 'border-slate-200 dark:border-slate-800',
    iconBg: 'bg-[#142B4A]/10 dark:bg-slate-800',
    iconColor: 'text-[#142B4A] dark:text-slate-200',
    valueColor: 'text-[#142B4A] dark:text-white',
    badgeBg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  },
  purple: {
    bg: 'bg-purple-50/70 dark:bg-purple-950/20',
    border: 'border-purple-200/80 dark:border-purple-800/40',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    iconColor: 'text-purple-600 dark:text-purple-400',
    valueColor: 'text-purple-700 dark:text-purple-400',
    badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  },
};

export function KPICard({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'navy',
  onClick,
  badge,
  className = '',
}: KPICardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      onClick={onClick}
      className={`relative p-3.5 rounded-2xl border backdrop-blur-md transition-all duration-200 ${
        styles.bg
      } ${styles.border} ${
        onClick ? 'cursor-pointer active:scale-[0.98] hover:shadow-md' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
            {title}
          </p>
          <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
            <span className={`text-lg font-bold tracking-tight ${styles.valueColor}`}>
              {value}
            </span>
            {badge !== undefined && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${styles.badgeBg}`}>
                {badge}
              </span>
            )}
          </div>
          {subtext && (
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {subtext}
            </p>
          )}
        </div>

        {Icon && (
          <div className={`p-2 rounded-xl flex-shrink-0 ${styles.iconBg}`}>
            <Icon size={18} className={styles.iconColor} />
          </div>
        )}
      </div>
    </div>
  );
}

export default KPICard;
