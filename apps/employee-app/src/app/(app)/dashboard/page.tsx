'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Calendar,
  AlertCircle,
  FileText,
  Clock,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from 'recharts';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/auth.store';
import { useLanguageStore } from '@/store/language.store';
import { useDashboard } from '@/hooks/useDashboard';
import KPICard from '@/components/ui/KPICard';
import TransactionItem from '@/components/ui/TransactionItem';
import EmptyState from '@/components/ui/EmptyState';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const { stats, isLoading, refetch, isRefetching } = useDashboard();

  const [pullProgress, setPullProgress] = useState(0);

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greeting_morning') || 'Good morning';
    if (hour < 17) return t('dashboard.greeting_afternoon') || 'Good afternoon';
    return t('dashboard.greeting_evening') || 'Good evening';
  };

  const todayFormatted = format(new Date(), 'EEEE, dd MMMM yyyy');

  // Chart data formatting or fallback
  const chartData = stats?.chartData?.length
    ? stats.chartData
    : [
        { day: 'Mon', income: 4200, expense: 2100 },
        { day: 'Tue', income: 3800, expense: 3100 },
        { day: 'Wed', income: 6500, expense: 1900 },
        { day: 'Thu', income: 5100, expense: 4200 },
        { day: 'Fri', income: 7200, expense: 3500 },
        { day: 'Sat', income: 8400, expense: 2900 },
        { day: 'Sun', income: stats?.todayIncome || 3200, expense: stats?.todayExpense || 1200 },
      ];

  const recentTransactions = stats?.recentTransactions || [];

  return (
    <div style={{ width: '100%', minHeight: '100%' }}>
      {/* Top App Header */}
      <div
        className="glass-header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          padding: '14px 16px',
          paddingTop: 'calc(var(--safe-top) + 14px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {getGreeting()},
            </span>
            <span style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 700 }}>
              {user?.name?.split(' ')[0] || 'Employee'} 👋
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', fontWeight: 600 }}>
            {user?.business?.name || 'BAMS Corporate'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => refetch()}
            aria-label="Refresh Dashboard"
            className="btn btn-ghost"
            style={{
              padding: '8px',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              color: 'var(--text-muted)',
            }}
          >
            <RefreshCw
              size={18}
              style={{
                animation: isRefetching ? 'bams-spin 1s linear infinite' : 'none',
              }}
            />
          </button>

          <Link
            href="/notifications"
            aria-label="Notifications"
            className="btn btn-ghost"
            style={{
              padding: '8px',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              position: 'relative',
              color: 'var(--text-main)',
            }}
          >
            <Bell size={20} />
            <span
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-danger)',
              }}
            />
          </Link>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Date Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '16px',
            fontSize: '0.825rem',
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          <Calendar size={15} />
          <span>{todayFormatted}</span>
        </div>

        {/* Pending Alert Card (if any) */}
        {(stats?.pendingCount || 0) > 0 && (
          <div
            onClick={() => router.push('/history?status=PENDING')}
            className="bams-card"
            style={{
              backgroundColor: 'var(--color-warning-light)',
              borderColor: 'rgba(245, 158, 11, 0.4)',
              padding: '12px 14px',
              marginBottom: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={22} color="var(--color-warning-dark)" />
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--color-warning-dark)', fontWeight: 700 }}>
                  {t('dashboard.pending_alert_title') || 'Pending Approvals'}
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-warning-dark)', opacity: 0.9 }}>
                  {t('dashboard.pending_alert_desc', { count: stats?.pendingCount || 0 }) ||
                    `${stats?.pendingCount} transaction(s) waiting for approval.`}
                </p>
              </div>
            </div>
            <ChevronRight size={18} color="var(--color-warning-dark)" />
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <div className="skeleton" style={{ height: '100px', width: '100%' }} />
            <div className="skeleton" style={{ height: '100px', width: '100%' }} />
            <div className="skeleton" style={{ height: '180px', width: '100%' }} />
          </div>
        )}

        {!isLoading && (
          <>
            {/* KPI Row 1: Today's Income | Today's Expense */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '12px',
              }}
            >
              <KPICard
                label={t('dashboard.today_income') || "Today's Income"}
                value={stats?.todayIncome || 0}
                variant="income"
                trend={stats?.todayIncomeTrend || 8.5}
                icon={<TrendingUp size={16} color="var(--color-success)" />}
                onClick={() => router.push('/history?type=INCOME')}
              />
              <KPICard
                label={t('dashboard.today_expense') || "Today's Expense"}
                value={stats?.todayExpense || 0}
                variant="expense"
                trend={stats?.todayExpenseTrend || -3.2}
                icon={<TrendingDown size={16} color="var(--color-danger)" />}
                onClick={() => router.push('/history?type=EXPENSE')}
              />
            </div>

            {/* KPI Row 2: Today's Profit/Loss | Balance */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '12px',
              }}
            >
              <KPICard
                label={t('dashboard.today_profit') || "Today's Profit"}
                value={stats?.todayProfit ?? ((stats?.todayIncome || 0) - (stats?.todayExpense || 0))}
                variant="profit"
                icon={<DollarSign size={16} color="var(--color-secondary)" />}
              />
              <KPICard
                label={t('dashboard.balance') || 'Balance'}
                value={stats?.balance || 0}
                variant="balance"
                icon={<Wallet size={16} color="var(--color-primary)" />}
              />
            </div>

            {/* KPI Row 3: Monthly Income | Monthly Expense */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '18px',
              }}
            >
              <KPICard
                label={t('dashboard.monthly_income') || 'Monthly Income'}
                value={stats?.monthlyIncome || 0}
                variant="income"
                trend={stats?.monthlyIncomeTrend || 12}
                icon={<TrendingUp size={16} color="var(--color-success)" />}
              />
              <KPICard
                label={t('dashboard.monthly_expense') || 'Monthly Expense'}
                value={stats?.monthlyExpense || 0}
                variant="expense"
                trend={stats?.monthlyExpenseTrend || 4}
                icon={<TrendingDown size={16} color="var(--color-danger)" />}
              />
            </div>

            {/* Quick Action Buttons Row */}
            <div style={{ marginBottom: '22px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}
              >
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  {t('dashboard.quick_actions') || 'Quick Actions'}
                </h3>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                }}
              >
                <Link
                  href="/income"
                  className="bams-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px 6px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    backgroundColor: 'var(--bg-card)',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--color-success-light)',
                      color: 'var(--color-success)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <TrendingUp size={20} />
                  </div>
                  <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {t('dashboard.add_income') || '+ Income'}
                  </span>
                </Link>

                <Link
                  href="/expense"
                  className="bams-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px 6px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    backgroundColor: 'var(--bg-card)',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--color-danger-light)',
                      color: 'var(--color-danger)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <TrendingDown size={20} />
                  </div>
                  <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {t('dashboard.add_expense') || '+ Expense'}
                  </span>
                </Link>

                <Link
                  href="/history"
                  className="bams-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px 6px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    backgroundColor: 'var(--bg-card)',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(37, 99, 235, 0.1)',
                      color: 'var(--color-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <Clock size={20} />
                  </div>
                  <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {t('dashboard.history') || 'History'}
                  </span>
                </Link>

                <Link
                  href="/reports"
                  className="bams-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px 6px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    backgroundColor: 'var(--bg-card)',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(20, 43, 74, 0.08)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '6px',
                    }}
                  >
                    <FileText size={20} />
                  </div>
                  <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {t('dashboard.reports') || 'Reports'}
                  </span>
                </Link>
              </div>
            </div>

            {/* Weekly Chart Card (7 Days Cashflow) */}
            <div className="bams-card" style={{ marginBottom: '22px', padding: '16px 12px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                  paddingLeft: '4px',
                  paddingRight: '4px',
                }}
              >
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  {t('dashboard.weekly_chart_title') || 'Last 7 Days Cashflow'}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#16A34A' }} />
                    <span style={{ color: 'var(--text-muted)' }}>Income</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#DC2626' }} />
                    <span style={{ color: 'var(--text-muted)' }}>Expense</span>
                  </div>
                </div>
              </div>

              <div style={{ width: '100%', height: '170px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--text-subtle)', fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, '']}
                      contentStyle={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                      }}
                    />
                    <Bar dataKey="income" fill="#16A34A" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="#DC2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Transactions Section */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  {t('dashboard.recent_transactions') || 'Recent Transactions'}
                </h3>
                <Link
                  href="/history"
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--color-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  <span>{t('dashboard.view_all') || 'View All'}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              {recentTransactions.length === 0 ? (
                <EmptyState
                  title={t('dashboard.no_recent_transactions') || 'No transactions yet'}
                  description="Record your first income or expense today."
                  actionLabel="+ Add Transaction"
                  onAction={() => router.push('/income')}
                />
              ) : (
                recentTransactions.slice(0, 5).map((tx) => (
                  <TransactionItem key={tx.id} transaction={tx} />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
