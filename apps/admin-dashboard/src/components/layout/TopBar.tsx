'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Globe,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useLanguageStore } from '@/store/language.store';
import { useTheme } from '@/providers';

interface TopBarProps {
  isSidebarCollapsed: boolean;
  unreadCount?: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  isSidebarCollapsed,
  unreadCount = 2,
}) => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { language, toggleLanguage, t } = useLanguageStore();
  const { theme, toggleTheme } = useTheme();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute breadcrumbs from pathname
  const pathParts = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((part, index) => {
    const href = '/' + pathParts.slice(0, index + 1).join('/');
    const title = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
    return { title, href };
  });

  return (
    <header
      className={`fixed top-0 right-0 h-16 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300 px-6 flex items-center justify-between ${
        isSidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs sm:text-sm">
        <Link
          href="/dashboard"
          className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
        >
          BAMS
        </Link>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.href}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link
              href={crumb.href}
              className={`font-medium ${
                idx === breadcrumbs.length - 1
                  ? 'text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {crumb.title}
            </Link>
          </React.Fragment>
        ))}
      </div>

      {/* Center: Global Search */}
      <div className="hidden md:flex items-center w-80">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search business, owner, or ledger..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          title="Switch Language (English / ગુજરાતી)"
        >
          <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>{language === 'EN' ? 'GU (ગુજરાતી)' : 'EN (English)'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Notifications Bell */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </Link>

        {/* Admin Profile Dropdown */}
        <div className="relative ml-1" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <div className="w-8 h-8 rounded-full bg-[#142B4A] dark:bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                {user?.name || 'Super Admin'}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                Root Admin
              </span>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-white truncate">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-slate-500 dark:text-slate-400 truncate text-[11px]">
                  {user?.email || 'admin@bams.internal'}
                </p>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>SUPER_ADMIN PRIVILEGES</span>
                </div>
              </div>

              <Link
                href="/settings"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('nav.settings', 'System Settings')}</span>
              </Link>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('nav.logout', 'Sign Out')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
