'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  UserCheck,
  Users,
  Activity,
  Ban,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CalendarDays,
  Shield,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguageStore } from '@/store/language.store';
import { StatsCard } from '@/components/ui/StatsCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SystemStatsChart } from '@/components/charts/SystemStatsChart';
import { BusinessGrowthChart } from '@/components/charts/BusinessGrowthChart';
import { TransactionVolumeChart } from '@/components/charts/TransactionVolumeChart';
import { format } from 'date-fns';

export default function AdminDashboardPage() {
  const { t } = useLanguageStore();

  const { data: statsData, isLoading, refetch } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.stats.getDashboardStats();
      return res.data;
    },
    refetchInterval: 60000,
  });

  const stats = statsData || {
    totalBusinesses: 0,
    activeBusinesses: 0,
    suspendedBusinesses: 0,
    totalOwners: 0,
    totalEmployees: 0,
    activeAccounts: 0,
    suspendedAccounts: 0,
    totalTransactions: 0,
    systemIncome: 0,
    systemExpenses: 0,
    systemProfit: 0,
    newThisMonth: 0,
    recentActivity: [],
    topBusinesses: [],
    recentUsers: [],
    pendingApprovals: [],
    businessGrowth: [],
    transactionVolume: [],
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'info';
      case 'DELETE':
        return 'danger';
      case 'APPROVE':
        return 'success';
      case 'REJECT':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('dashboard.title', 'System Overview')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('dashboard.subtitle', 'Real-time ecosystem metrics across all managed businesses')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs"
          >
            {t('common.refresh', 'Refresh Metrics')}
          </Button>
          <Link href="/reports">
            <Button variant="primary" size="sm" className="text-xs">
              {t('reports.title', 'Financial Reports')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Section 1 — System KPI Cards (Grid 5x2 / 4x3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatsCard
          label={t('dashboard.totalBusinesses', 'Total Businesses')}
          value={stats.totalBusinesses}
          icon={<Building2 className="w-5 h-5" />}
          href="/businesses"
          iconBgColor="bg-blue-50 dark:bg-blue-950/40"
          iconTextColor="text-blue-600 dark:text-blue-400"
          trend={{ value: '+2', isPositive: true, text: 'this month' }}
        />

        <StatsCard
          label={t('dashboard.totalOwners', 'Business Owners')}
          value={stats.totalOwners}
          icon={<UserCheck className="w-5 h-5" />}
          href="/owners"
          iconBgColor="bg-[#142B4A]/10 dark:bg-indigo-950/40"
          iconTextColor="text-[#142B4A] dark:text-indigo-400"
          trend={{ value: '100%', isNeutral: true, text: 'assigned' }}
        />

        <StatsCard
          label={t('dashboard.totalEmployees', 'Total Employees')}
          value={stats.totalEmployees}
          icon={<Users className="w-5 h-5" />}
          href="/employees"
          iconBgColor="bg-indigo-50 dark:bg-indigo-950/40"
          iconTextColor="text-indigo-600 dark:text-indigo-400"
          trend={{ value: '+4', isPositive: true, text: 'recruited' }}
        />

        <StatsCard
          label={t('dashboard.activeAccounts', 'Active Accounts')}
          value={stats.activeAccounts}
          icon={<Activity className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/40"
          iconTextColor="text-emerald-600 dark:text-emerald-400"
          trend={{ value: '98.2%', isPositive: true, text: 'operational' }}
        />

        <StatsCard
          label={t('dashboard.suspendedAccounts', 'Suspended Accounts')}
          value={stats.suspendedAccounts}
          icon={<Ban className="w-5 h-5" />}
          iconBgColor="bg-rose-50 dark:bg-rose-950/40"
          iconTextColor="text-rose-600 dark:text-rose-400"
          trend={{ value: '1', isPositive: false, text: 'action needed' }}
        />

        <StatsCard
          label={t('dashboard.totalTransactions', 'Total Transactions')}
          value={stats.totalTransactions.toLocaleString()}
          icon={<ArrowLeftRight className="w-5 h-5" />}
          href="/transactions"
          iconBgColor="bg-purple-50 dark:bg-purple-950/40"
          iconTextColor="text-purple-600 dark:text-purple-400"
          trend={{ value: '+14%', isPositive: true, text: 'vs last mo' }}
        />

        <StatsCard
          label={t('dashboard.systemIncome', 'System Income')}
          value={formatCurrency(stats.systemIncome)}
          icon={<TrendingUp className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/40"
          iconTextColor="text-emerald-600 dark:text-emerald-400"
          trend={{ value: '+18.5%', isPositive: true, text: 'consolidated' }}
        />

        <StatsCard
          label={t('dashboard.systemExpenses', 'System Expenses')}
          value={formatCurrency(stats.systemExpenses)}
          icon={<TrendingDown className="w-5 h-5" />}
          iconBgColor="bg-rose-50 dark:bg-rose-950/40"
          iconTextColor="text-rose-600 dark:text-rose-400"
          trend={{ value: '+9.2%', isPositive: false, text: 'consolidated' }}
        />

        <StatsCard
          label={t('dashboard.netProfit', 'Net System Profit')}
          value={formatCurrency(stats.systemProfit)}
          icon={<DollarSign className="w-5 h-5" />}
          iconBgColor="bg-blue-50 dark:bg-blue-950/40"
          iconTextColor="text-blue-600 dark:text-blue-400"
          trend={{ value: '+24.1%', isPositive: true, text: 'gross net' }}
        />

        <StatsCard
          label={t('dashboard.newThisMonth', 'New This Month')}
          value={stats.newThisMonth}
          icon={<CalendarDays className="w-5 h-5" />}
          iconBgColor="bg-amber-50 dark:bg-amber-950/40"
          iconTextColor="text-amber-600 dark:text-amber-400"
          trend={{ value: 'Entities', isNeutral: true, text: 'onboarded' }}
        />
      </div>

      {/* Section 2 — Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BusinessGrowthChart
          data={stats.businessGrowth.length > 0 ? stats.businessGrowth : undefined}
          height={280}
        />
        <TransactionVolumeChart
          data={stats.transactionVolume.length > 0 ? stats.transactionVolume : undefined}
          height={280}
        />
        <SystemStatsChart
          data={
            stats.topBusinesses.length > 0
              ? stats.topBusinesses.map((b) => ({
                  name: b.name.split(' ')[0],
                  income: b.totalIncome,
                  expenses: b.totalExpenses,
                }))
              : undefined
          }
          height={280}
        />
      </div>

      {/* Section 3 & 4 — Recent Activity Feed + Key Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top 5 Businesses */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t('dashboard.topBusinesses', 'Top Businesses by Volume')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Leading entities ranked by recorded transactions
                </p>
              </div>
              <Link
                href="/businesses"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="py-2.5 px-3">Business</th>
                    <th className="py-2.5 px-3">Staff</th>
                    <th className="py-2.5 px-3">Txns</th>
                    <th className="py-2.5 px-3 text-right">Income</th>
                    <th className="py-2.5 px-3 text-right">Expenses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.topBusinesses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No businesses registered yet.
                      </td>
                    </tr>
                  ) : (
                    stats.topBusinesses.map((b) => (
                      <tr key={b.businessId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                          <Link href={`/businesses/${b.businessId}`} className="hover:text-blue-600">
                            {b.name}
                          </Link>
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                          {b.employeeCount}
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                          {b.transactionCount}
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(b.totalIncome)}
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-rose-600 dark:text-rose-400">
                          {formatCurrency(b.totalExpenses)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Approvals Across System */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t('dashboard.pendingApprovals', 'Pending Approvals Across System')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Transactions awaiting owner or administrator authorization
                </p>
              </div>
              <Link
                href="/transactions?status=PENDING"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Business</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.pendingApprovals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        {t('dashboard.noPendingApprovals', 'Zero pending approvals across all businesses.')}
                      </td>
                    </tr>
                  ) : (
                    stats.pendingApprovals.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {format(new Date(tx.date), 'MMM dd, HH:mm')}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                          {tx.business?.name || '—'}
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant={tx.type === 'INCOME' ? 'success' : 'danger'}>
                            {tx.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                          {tx.category}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                          {formatCurrency(Number(tx.amount))}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link href="/transactions">
                            <span className="text-blue-600 hover:underline font-semibold cursor-pointer">
                              Review
                            </span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Recent Activity Audit Stream */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {t('dashboard.recentActivity', 'Recent Activity Feed')}
              </h3>
            </div>
            <Link
              href="/audit"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Full Log
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[560px]">
            {stats.recentActivity.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                {t('dashboard.noRecentActivity', 'No audit activities recorded.')}
              </div>
            ) : (
              stats.recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col gap-1.5 transition hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant={getActionBadgeVariant(log.action)}>
                      {log.action}
                    </Badge>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(log.createdAt), 'HH:mm:ss')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                    {log.actor?.name || 'System'}
                    <span className="text-slate-400 font-normal"> modified </span>
                    {log.entity}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>ID: {log.entityId.slice(0, 8)}...</span>
                    <span>{log.ipAddress || 'Internal'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
