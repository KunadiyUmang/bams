'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  UserCheck,
  Users,
  ArrowLeftRight,
  BarChart3,
  TrendingUp,
  Bell,
  Shield,
  Settings,
  Globe,
  Database,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useLanguageStore } from '@/store/language.store';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  unreadNotificationsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  unreadNotificationsCount = 2,
}) => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { language, toggleLanguage, t } = useLanguageStore();

  const navItems = [
    {
      label: t('nav.dashboard', 'Dashboard'),
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: t('nav.businesses', 'Businesses'),
      href: '/businesses',
      icon: Building2,
    },
    {
      label: t('nav.owners', 'Owners'),
      href: '/owners',
      icon: UserCheck,
    },
    {
      label: t('nav.employees', 'Employees'),
      href: '/employees',
      icon: Users,
    },
    {
      label: t('nav.transactions', 'Transactions'),
      href: '/transactions',
      icon: ArrowLeftRight,
    },
    {
      label: t('nav.reports', 'Financial Reports'),
      href: '/reports',
      icon: BarChart3,
    },
    {
      label: t('nav.notifications', 'Notifications'),
      href: '/notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
    },
    {
      label: t('nav.audit', 'Audit Logs'),
      href: '/audit',
      icon: Shield,
    },
    {
      label: t('nav.settings', 'System Settings'),
      href: '/settings',
      icon: Settings,
    },
    {
      label: t('nav.backup', 'Backup'),
      href: '/settings?tab=backup',
      icon: Database,
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[#0F2137] dark:bg-[#070C14] text-white flex flex-col transition-all duration-300 ease-in-out border-r border-[#193456] dark:border-slate-800/80 shadow-xl ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#193456] dark:border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-xl text-white shadow-md shrink-0">
            B
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-base text-white leading-tight">
                BAMS
              </span>
              <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
                Super Admin
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#193456] transition shrink-0"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Items List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href.split('?')[0]));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#193456]/70'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                }`}
              />

              {!isCollapsed && <span className="truncate">{item.label}</span>}

              {item.badge !== undefined && (
                <span
                  className={`ml-auto shrink-0 px-2 py-0.5 text-[11px] font-bold rounded-full ${
                    isActive
                      ? 'bg-white text-blue-600'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Collapsed Tooltip */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}

        {/* Language quick switcher in sidebar */}
        <button
          onClick={toggleLanguage}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-[#193456]/70 transition-all duration-150 group relative"
          title={isCollapsed ? `Language: ${language}` : undefined}
        >
          <Globe className="w-5 h-5 text-slate-400 group-hover:text-white shrink-0" />
          {!isCollapsed && (
            <div className="flex items-center justify-between w-full">
              <span>{t('nav.language', 'Language')}</span>
              <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded bg-[#193456] text-blue-300">
                {language}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Admin Profile & Logout */}
      <div className="p-3 border-t border-[#193456] dark:border-slate-800 bg-[#0A1829]/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow">
            {user?.name ? user.name[0].toUpperCase() : 'A'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.name || 'Super Admin'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || 'admin@bams.internal'}
              </p>
            </div>
          )}
          <button
            onClick={() => logout()}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition shrink-0"
            title={t('nav.logout', 'Sign Out')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
