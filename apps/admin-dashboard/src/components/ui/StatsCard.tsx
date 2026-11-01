'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    isNeutral?: boolean;
    text?: string;
  };
  subtitle?: string;
  href?: string;
  onClick?: () => void;
  iconBgColor?: string;
  iconTextColor?: string;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  icon,
  trend,
  subtitle,
  href,
  onClick,
  iconBgColor = 'bg-blue-50 dark:bg-blue-950/40',
  iconTextColor = 'text-blue-600 dark:text-blue-400',
  className = '',
}) => {
  const CardContent = (
    <div
      className={`relative p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 ${
        href || onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 flex-1 pr-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl shrink-0 ${iconBgColor} ${iconTextColor}`}>
          {icon}
        </div>
      </div>

      {(trend || subtitle) && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          {trend ? (
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-0.5 font-semibold ${
                  trend.isNeutral
                    ? 'text-slate-500'
                    : trend.isPositive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {trend.isNeutral ? (
                  <Minus className="w-3.5 h-3.5" />
                ) : trend.isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {trend.value}
              </span>
              {trend.text && (
                <span className="text-slate-500 dark:text-slate-400">{trend.text}</span>
              )}
            </div>
          ) : (
            <div />
          )}

          {subtitle && (
            <span className="text-slate-400 dark:text-slate-500 text-[11px] truncate">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
};

export default StatsCard;
