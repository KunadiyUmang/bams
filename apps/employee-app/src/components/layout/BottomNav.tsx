'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useLanguageStore } from '@/store/language.store';
import Modal from '@/components/ui/Modal';

interface BottomNavProps {
  pendingCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ pendingCount = 0 }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguageStore();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const navItems = [
    {
      label: t('dashboard.history') === 'History' ? 'Home' : 'હોમ',
      path: '/dashboard',
      icon: Home,
    },
    {
      label: t('dashboard.add_income').replace('+', '').trim() || 'Income',
      path: '/income',
      icon: TrendingUp,
    },
    // Center FAB is handled separately
    {
      label: t('dashboard.add_expense').replace('+', '').trim() || 'Expense',
      path: '/expense',
      icon: TrendingDown,
    },
    {
      label: t('dashboard.history') || 'History',
      path: '/history',
      icon: Clock,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      label: t('profile.profile') === 'Profile & Settings' ? 'Profile' : 'પ્રોફાઇલ',
      path: '/profile',
      icon: User,
    },
  ];

  const handleSelectQuickAdd = (type: 'income' | 'expense') => {
    setIsQuickAddOpen(false);
    if (type === 'income') {
      router.push('/income');
    } else {
      router.push('/expense');
    }
  };

  return (
    <>
      <nav
        className="glass-nav"
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '440px',
          height: 'calc(var(--nav-height) + var(--safe-bottom))',
          paddingBottom: 'var(--safe-bottom)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 100,
          paddingLeft: '6px',
          paddingRight: '6px',
        }}
      >
        {/* First 2 tabs */}
        {navItems.slice(0, 2).map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                height: '100%',
                textDecoration: 'none',
                color: active ? 'var(--color-secondary)' : 'var(--text-muted)',
                transition: 'color var(--transition-fast)',
                position: 'relative',
              }}
            >
              <div style={{ position: 'relative' }}>
                <Icon
                  size={21}
                  strokeWidth={active ? 2.5 : 2}
                  style={{
                    transform: active ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform var(--transition-fast)',
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: active ? 600 : 500,
                  marginTop: '3px',
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Center FAB (+) Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
          }}
        >
          <button
            type="button"
            onClick={() => setIsQuickAddOpen(true)}
            aria-label="Quick Add"
            className="fab-button"
            style={{
              outline: 'none',
              border: 'none',
            }}
          >
            <Plus size={28} strokeWidth={2.8} />
          </button>
        </div>

        {/* Remaining 3 tabs */}
        {navItems.slice(2).map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                height: '100%',
                textDecoration: 'none',
                color: active ? 'var(--color-secondary)' : 'var(--text-muted)',
                transition: 'color var(--transition-fast)',
                position: 'relative',
              }}
            >
              <div style={{ position: 'relative' }}>
                <Icon
                  size={21}
                  strokeWidth={active ? 2.5 : 2}
                  style={{
                    transform: active ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform var(--transition-fast)',
                  }}
                />
                {item.badge !== undefined && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-8px',
                      backgroundColor: 'var(--color-warning)',
                      color: '#FFFFFF',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: active ? 600 : 500,
                  marginTop: '3px',
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Quick Add Modal */}
      <Modal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        title={t('common.quick_add') || 'Quick Add Transaction'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '4px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {t('common.choose_action') || 'Select the type of transaction you want to record:'}
          </p>

          <button
            type="button"
            onClick={() => handleSelectQuickAdd('income')}
            className="btn btn-block"
            style={{
              backgroundColor: 'var(--color-success-light)',
              color: 'var(--color-success-dark)',
              border: '1.5px solid rgba(22, 163, 74, 0.3)',
              padding: '16px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-success)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ArrowDownRight size={22} strokeWidth={2.5} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, display: 'block' }}>
                  {t('income.add_income') || 'Record Income'}
                </span>
                <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  Sales, client payments, deposits
                </span>
              </div>
            </div>
            <Plus size={20} />
          </button>

          <button
            type="button"
            onClick={() => handleSelectQuickAdd('expense')}
            className="btn btn-block"
            style={{
              backgroundColor: 'var(--color-danger-light)',
              color: 'var(--color-danger-dark)',
              border: '1.5px solid rgba(220, 38, 38, 0.3)',
              padding: '16px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-danger)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ArrowUpRight size={22} strokeWidth={2.5} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, display: 'block' }}>
                  {t('expense.add_expense') || 'Record Expense'}
                </span>
                <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  Purchases, bills, travel, supplies
                </span>
              </div>
            </div>
            <Plus size={20} />
          </button>
        </div>
      </Modal>
    </>
  );
};

export default BottomNav;
