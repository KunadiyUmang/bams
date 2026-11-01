'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, Users, FileText, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePendingApprovals } from '@/hooks/useApprovals';
import { useLanguageStore } from '@/store/language.store';

export function BottomNav() {
  const pathname = usePathname();
  const t = useLanguageStore((state) => state.t);
  const { data: pendingData } = usePendingApprovals({ limit: 1 });
  const pendingCount = pendingData?.total ?? 0;

  const tabs = [
    {
      label: t('nav.dashboard', 'Dashboard'),
      href: '/dashboard',
      icon: LayoutDashboard,
      badge: 0,
    },
    {
      label: t('nav.transactions', 'Transactions'),
      href: '/transactions',
      icon: ArrowLeftRight,
      badge: pendingCount,
    },
    {
      label: t('nav.employees', 'Employees'),
      href: '/employees',
      icon: Users,
      badge: 0,
    },
    {
      label: t('nav.reports', 'Reports'),
      href: '/reports',
      icon: FileText,
      badge: 0,
    },
    {
      label: t('nav.profile', 'Profile'),
      href: '/profile',
      icon: User,
      badge: 0,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">
      <div className="mx-3 mb-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/80 dark:border-slate-800 shadow-lg px-2 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href));
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors min-w-[56px]"
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={`transition-colors duration-200 ${
                    isActive
                      ? 'text-[#2563EB] dark:text-blue-400 font-semibold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                />
                {tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-white font-bold text-[10px] min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] mt-1 font-medium tracking-tight transition-colors duration-200 ${
                  isActive
                    ? 'text-[#2563EB] dark:text-blue-400 font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {tab.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeBottomTab"
                  className="absolute bottom-0 w-8 h-[3px] bg-[#2563EB] dark:bg-blue-400 rounded-full"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
