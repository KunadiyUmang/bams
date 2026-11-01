'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  Bell,
  Globe,
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  Users,
  PlusCircle,
  MinusCircle,
  CheckCircle,
  RefreshCw,
  Building,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useLanguageStore } from '@/store/language.store';
import { useDashboard } from '@/hooks/useDashboard';
import { useApproveTransaction, useRejectTransaction } from '@/hooks/useApprovals';
import { useCreateTransaction } from '@/hooks/useTransactions';
import { KPICard } from '@/components/ui/KPICard';
import { TransactionItem } from '@/components/ui/TransactionItem';
import { ApprovalCard } from '@/components/ui/ApprovalCard';
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { TransactionType, PaymentMethod } from '@/types';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { language, toggleLanguage, t } = useLanguageStore();
  const { data: stats, isLoading, isRefetching, refetch } = useDashboard();

  const approveMutation = useApproveTransaction();
  const rejectMutation = useRejectTransaction();
  const createTxMutation = useCreateTransaction();

  // Quick transaction modal state
  const [modalType, setModalType] = useState<TransactionType | null>(null);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);

  const business = user?.business;
  const businessName = business?.name || 'My Enterprise';
  const todayStr = format(new Date(), 'EEEE, dd MMMM yyyy');

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalType || !amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await createTxMutation.mutateAsync({
        type: modalType,
        amount: Number(amount),
        category: category || (modalType === TransactionType.INCOME ? 'Sales' : 'Expense'),
        description,
        paymentMethod,
        date: new Date().toISOString(),
      });
      setModalType(null);
      setAmount('');
      setCategory('');
      setDescription('');
    } catch (err) {
      // Error handled by mutation
    }
  };

  return (
    <div className="min-h-screen">
      {/* SECTION 1: HEADER */}
      <div className="bg-gradient-to-r from-[#142B4A] via-[#1E3E6B] to-[#2563EB] text-white p-4 pt-5 pb-6 rounded-b-[2rem] shadow-xl">
        <div className="flex items-center justify-between gap-3">
          {/* Business Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-lg overflow-hidden flex-shrink-0 shadow-inner">
              {business?.logo ? (
                <img
                  src={business.logo}
                  alt={businessName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building size={22} className="text-white" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-extrabold truncate tracking-tight">
                {businessName}
              </h1>
              <p className="text-[11px] text-blue-100/70 truncate">{todayStr}</p>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-[11px] font-medium transition-colors"
            >
              <Globe size={13} />
              <span>{language === 'en' ? 'ગુજરાતી' : 'EN'}</span>
            </button>

            {/* Notification Bell */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-colors"
            >
              <Bell size={16} />
              {(stats?.pendingApprovals ?? 0) > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white/20 animate-pulse" />
              )}
            </Link>

            {/* Refresh */}
            <button
              onClick={() => refetch()}
              className={`p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-colors ${
                isRefetching ? 'animate-spin' : ''
              }`}
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Balance Highlight Banner */}
        <div className="mt-4 p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-100/80 font-medium">
              {t('dashboard.totalBalance', 'Current Balance')}
            </p>
            <h2 className="text-xl font-extrabold mt-0.5 tracking-tight">
              ₹{(stats?.currentBalance ?? 0).toLocaleString('en-IN')}
            </h2>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-blue-100/80 block">
              {t('dashboard.pendingApprovals', 'Pending Approvals')}
            </span>
            <Link
              href="/transactions/approvals"
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200 mt-0.5"
            >
              <span>{stats?.pendingApprovals ?? 0} {t('common.actions', 'Waiting')}</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* SECTION 2: FINANCIAL KPI CARDS (HORIZONTAL SCROLL) */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('dashboard.businessOverview', 'Financial KPIs')}
            </h2>
          </div>

          {isLoading ? (
            <SkeletonLoader rows={2} />
          ) : (
            <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar snap-x">
              {/* Today's Income */}
              <div className="snap-start min-w-[155px]">
                <KPICard
                  title={t('dashboard.todayIncome', "Today's Income")}
                  value={`₹${(stats?.todayIncome ?? 0).toLocaleString('en-IN')}`}
                  variant="green"
                  icon={TrendingUp}
                />
              </div>

              {/* Today's Expenses */}
              <div className="snap-start min-w-[155px]">
                <KPICard
                  title={t('dashboard.todayExpenses', "Today's Expenses")}
                  value={`₹${(stats?.todayExpenses ?? 0).toLocaleString('en-IN')}`}
                  variant="red"
                  icon={TrendingDown}
                />
              </div>

              {/* Today's Profit */}
              <div className="snap-start min-w-[155px]">
                <KPICard
                  title={t('dashboard.todayProfit', "Today's Profit")}
                  value={`₹${(stats?.todayProfit ?? 0).toLocaleString('en-IN')}`}
                  variant="blue"
                  icon={Wallet}
                />
              </div>

              {/* Monthly Income */}
              <div className="snap-start min-w-[155px]">
                <KPICard
                  title={t('dashboard.monthlyIncome', 'Monthly Income')}
                  value={`₹${(stats?.monthlyIncome ?? 0).toLocaleString('en-IN')}`}
                  variant="green"
                />
              </div>

              {/* Monthly Expenses */}
              <div className="snap-start min-w-[155px]">
                <KPICard
                  title={t('dashboard.monthlyExpenses', 'Monthly Expenses')}
                  value={`₹${(stats?.monthlyExpenses ?? 0).toLocaleString('en-IN')}`}
                  variant="red"
                />
              </div>

              {/* Monthly Profit */}
              <div className="snap-start min-w-[155px]">
                <KPICard
                  title={t('dashboard.monthlyProfit', 'Monthly Profit')}
                  value={`₹${(stats?.monthlyProfit ?? 0).toLocaleString('en-IN')}`}
                  variant="blue"
                />
              </div>

              {/* Total Investment */}
              <div className="snap-start min-w-[155px]">
                <KPICard
                  title={t('dashboard.totalInvestment', 'Total Investment')}
                  value={`₹${(stats?.totalInvestment ?? 0).toLocaleString('en-IN')}`}
                  variant="purple"
                />
              </div>

              {/* Total Employees */}
              <div className="snap-start min-w-[155px]">
                <KPICard
                  title={t('dashboard.totalEmployees', 'Total Staff')}
                  value={stats?.totalEmployees ?? 0}
                  subtext={`${stats?.activeEmployees ?? 0} active`}
                  variant="navy"
                  icon={Users}
                  onClick={() => router.push('/employees')}
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: QUICK ACTIONS */}
        <div className="grid grid-cols-4 gap-2">
          {/* Pending Approvals Shortcut */}
          <Link
            href="/transactions/approvals"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-amber-400 text-center active:scale-95 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-1.5 relative">
              <ShieldCheck size={20} />
              {(stats?.pendingApprovals ?? 0) > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {stats?.pendingApprovals}
                </span>
              )}
            </div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">
              {t('dashboard.approvalsShortcut', 'Approvals')}
            </span>
          </Link>

          {/* Add Income */}
          <button
            onClick={() => setModalType(TransactionType.INCOME)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-emerald-400 text-center active:scale-95 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-1.5">
              <PlusCircle size={20} />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">
              {t('dashboard.addIncome', 'Income')}
            </span>
          </button>

          {/* Add Expense */}
          <button
            onClick={() => setModalType(TransactionType.EXPENSE)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-rose-400 text-center active:scale-95 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-1.5">
              <MinusCircle size={20} />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">
              {t('dashboard.addExpense', 'Expense')}
            </span>
          </button>

          {/* View Employees */}
          <Link
            href="/employees"
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-blue-400 text-center active:scale-95 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#2563EB] dark:text-blue-400 mb-1.5">
              <Users size={20} />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">
              {t('dashboard.viewEmployees', 'Staff')}
            </span>
          </Link>
        </div>

        {/* SECTION 4: INCOME VS EXPENSE CHART (LAST 7 DAYS) */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('dashboard.incomeVsExpense', 'Income vs Expense (Last 7 Days)')}
            </h2>
          </div>
          <IncomeExpenseChart data={stats?.last7Days || []} height={210} />
        </div>

        {/* SECTION 5: RECENT PENDING APPROVALS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('dashboard.recentPendingApprovals', 'Pending Approvals')}
            </h2>
            <Link
              href="/transactions/approvals"
              className="text-xs font-bold text-[#2563EB] dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>{t('common.viewAll', 'View All')}</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {stats?.pendingTransactions && stats.pendingTransactions.length > 0 ? (
            <div className="space-y-3">
              {stats.pendingTransactions.slice(0, 3).map((tx) => (
                <ApprovalCard
                  key={tx.id}
                  transaction={tx}
                  onApprove={(id) => approveMutation.mutate(id)}
                  onReject={(id, reason) => rejectMutation.mutate({ id, reason })}
                  isApproving={approveMutation.isPending}
                  isRejecting={rejectMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
              <CheckCircle size={28} className="mx-auto text-emerald-500 mb-1.5" />
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {t('dashboard.noApprovalsPending', 'All clear! No pending approvals.')}
              </p>
            </div>
          )}
        </div>

        {/* SECTION 6: RECENT TRANSACTIONS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('dashboard.recentTransactions', 'Recent Transactions')}
            </h2>
            <Link
              href="/transactions"
              className="text-xs font-bold text-[#2563EB] dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>{t('common.viewAll', 'View All')}</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
            <div className="space-y-2">
              {stats.recentTransactions.slice(0, 5).map((tx) => (
                <TransactionItem key={tx.id} transaction={tx} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={t('dashboard.noTransactions', 'No recent transactions found')}
            />
          )}
        </div>

        {/* SECTION 7: TOP EMPLOYEES THIS MONTH */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('dashboard.topEmployees', 'Top Staff Members')}
            </h2>
            <Link
              href="/employees"
              className="text-xs font-bold text-[#2563EB] dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>{t('common.viewAll', 'View All')}</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {stats?.topEmployees && stats.topEmployees.length > 0 ? (
            <div className="space-y-2">
              {stats.topEmployees.map((emp) => (
                <div
                  key={emp.userId}
                  onClick={() => router.push(`/employees/${emp.userId}`)}
                  className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 cursor-pointer active:scale-[0.99] transition-all hover:border-blue-400/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#142B4A] to-[#2563EB] text-white flex items-center justify-center font-bold text-xs shadow">
                      {emp.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {emp.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {emp.transactionCount} transactions recorded
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{emp.totalIncome.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Total Income</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-400">
              {t('dashboard.noEmployees', 'No employee data recorded yet')}
            </div>
          )}
        </div>
      </div>

      {/* QUICK ADD MODAL */}
      <Modal
        isOpen={!!modalType}
        onClose={() => setModalType(null)}
        title={
          modalType === TransactionType.INCOME
            ? t('dashboard.addIncome', 'Record New Income')
            : t('dashboard.addExpense', 'Record New Expense')
        }
      >
        <form onSubmit={handleQuickAdd} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t('common.amount', 'Amount (₹)')} *
            </label>
            <input
              type="number"
              required
              min="1"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t('common.category', 'Category')}
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder={modalType === TransactionType.INCOME ? 'Sales, Service, etc.' : 'Supplies, Rent, Utilities, etc.'}
              className="w-full text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t('transactions.paymentMethod', 'Payment Method')}
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={PaymentMethod.CASH}>Cash</option>
              <option value={PaymentMethod.UPI}>UPI</option>
              <option value={PaymentMethod.BANK}>Bank Transfer</option>
              <option value={PaymentMethod.ONLINE}>Online Card</option>
              <option value={PaymentMethod.CHEQUE}>Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t('transactions.description', 'Description')}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional remarks..."
              className="w-full text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={createTxMutation.isPending}
              className="flex-1 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold shadow-md disabled:opacity-50"
            >
              {createTxMutation.isPending ? t('common.loading', 'Saving...') : t('common.save', 'Save')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
