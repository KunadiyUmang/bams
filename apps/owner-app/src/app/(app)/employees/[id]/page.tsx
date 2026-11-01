'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Phone,
  Mail,
  Calendar,
  Power,
  Edit2,
  FileText,
  User as UserIcon,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KPICard } from '@/components/ui/KPICard';
import { TransactionItem } from '@/components/ui/TransactionItem';
import { LoadingSpinner, SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import {
  useEmployee,
  useEmployeeStats,
  useToggleEmployeeActive,
  useUpdateEmployee,
} from '@/hooks/useEmployees';
import { useTransactions } from '@/hooks/useTransactions';
import { useLanguageStore } from '@/store/language.store';
import { format } from 'date-fns';

type Tab = 'OVERVIEW' | 'TRANSACTIONS' | 'REPORTS';

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const t = useLanguageStore((state) => state.t);

  const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);

  const { data: employee, isLoading: empLoading } = useEmployee(id);
  const { data: stats, isLoading: statsLoading } = useEmployeeStats(id);
  const { data: txData, isLoading: txLoading } = useTransactions({ userId: id, limit: 20 });

  const toggleActiveMutation = useToggleEmployeeActive();
  const updateMutation = useUpdateEmployee();

  // Edit form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  const handleOpenEdit = () => {
    if (employee) {
      setName(employee.name);
      setPhone(employee.phone || '');
      setEmployeeId(employee.employeeId || '');
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    await updateMutation.mutateAsync({
      id: employee.id,
      data: { name, phone, employeeId },
    });
    setShowEditModal(false);
  };

  const handleToggleStatus = async () => {
    if (!employee) return;
    await toggleActiveMutation.mutateAsync({
      id: employee.id,
      isActive: !employee.isActive,
    });
    setShowToggleModal(false);
  };

  if (empLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size={32} label="Loading staff profile..." />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen">
        <PageHeader title={t('employees.title', 'Staff Member')} showBack />
        <div className="p-6 text-center text-slate-500 text-sm">
          Employee not found.
        </div>
      </div>
    );
  }

  const initials = employee.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const totalIncome = stats?.totalIncome ?? 0;
  const totalExpenses = stats?.totalExpenses ?? 0;
  const netContribution = stats?.netContribution ?? totalIncome - totalExpenses;
  const transactionCount = stats?.transactionCount ?? txData?.total ?? 0;

  return (
    <div className="min-h-screen pb-12">
      <PageHeader
        title={employee.name}
        subtitle={employee.employeeId || 'Staff Member'}
        showBack
        rightAction={
          <button
            onClick={handleOpenEdit}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Edit2 size={17} />
          </button>
        }
      />

      {/* Header Profile Section */}
      <div className="p-4 bg-gradient-to-r from-[#142B4A] to-[#1E3E6B] text-white">
        <div className="flex items-center gap-3.5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-lg border border-white/20 shadow-md flex-shrink-0">
            {employee.profilePhoto ? (
              <img
                src={employee.profilePhoto}
                alt={employee.name}
                className="w-full h-full rounded-2xl object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold truncate">{employee.name}</h2>
              <StatusBadge status={employee.isActive ? 'ACTIVE' : 'INACTIVE'} size="sm" />
            </div>

            <p className="text-xs text-blue-200/80 truncate mt-0.5">{employee.email}</p>
            {employee.phone && (
              <p className="text-xs text-blue-200/80 mt-0.5">{employee.phone}</p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
          <button
            onClick={() => setShowToggleModal(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all ${
              employee.isActive
                ? 'bg-rose-500/20 text-rose-200 border-rose-500/30 hover:bg-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30 hover:bg-emerald-500/30'
            }`}
          >
            <Power size={13} />
            <span>{employee.isActive ? 'Deactivate Account' : 'Activate Account'}</span>
          </button>

          <button
            onClick={() => router.push(`/reports?employee=${employee.id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/15 text-white border border-white/20 hover:bg-white/25 transition-all"
          >
            <FileText size={13} />
            <span>{t('employees.viewFullReport', 'Full Report')}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
        {(['OVERVIEW', 'TRANSACTIONS'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-[#2563EB] text-[#2563EB] dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400'
            }`}
          >
            {tab === 'OVERVIEW'
              ? t('employees.overview', 'Overview')
              : t('employees.transactionsTab', 'Transactions')}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 space-y-4">
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-4">
            {/* Financial Summary */}
            <div className="grid grid-cols-2 gap-2.5">
              <KPICard
                title={t('employees.totalIncome', 'Recorded Income')}
                value={`₹${totalIncome.toLocaleString('en-IN')}`}
                variant="green"
                icon={TrendingUp}
              />
              <KPICard
                title={t('employees.totalExpenses', 'Recorded Expenses')}
                value={`₹${totalExpenses.toLocaleString('en-IN')}`}
                variant="red"
                icon={TrendingDown}
              />
              <KPICard
                title={t('employees.netContribution', 'Net Cash Flow')}
                value={`₹${netContribution.toLocaleString('en-IN')}`}
                variant="blue"
                icon={Wallet}
              />
              <KPICard
                title={t('employees.totalTransactions', 'Total Transactions')}
                value={transactionCount}
                variant="purple"
                icon={Receipt}
              />
            </div>

            {/* Recent Activity */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Recent Submissions
              </h3>
              {txLoading ? (
                <SkeletonLoader rows={3} />
              ) : txData?.data && txData.data.length > 0 ? (
                txData.data.slice(0, 5).map((tx) => (
                  <TransactionItem key={tx.id} transaction={tx} showUser={false} />
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">
                  No transactions recorded yet by this staff member.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'TRANSACTIONS' && (
          <div className="space-y-2">
            {txLoading ? (
              <SkeletonLoader rows={4} />
            ) : txData?.data && txData.data.length > 0 ? (
              txData.data.map((tx) => (
                <TransactionItem key={tx.id} transaction={tx} showUser={false} />
              ))
            ) : (
              <EmptyState
                icon={Receipt}
                title="No transactions"
                description="This staff member has not recorded any transactions yet."
              />
            )}
          </div>
        )}
      </div>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={t('employees.editEmployee', 'Edit Employee')}
      >
        <form onSubmit={handleSaveEdit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t('employees.name', 'Full Name')}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t('employees.phone', 'Phone Number')}
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t('employees.employeeId', 'Employee ID')}
            </label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-semibold shadow"
            >
              {updateMutation.isPending ? t('common.loading', 'Saving...') : t('common.save', 'Save')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Toggle Status Confirmation Modal */}
      <Modal
        isOpen={showToggleModal}
        onClose={() => setShowToggleModal(false)}
        title={employee.isActive ? 'Deactivate Employee' : 'Activate Employee'}
        description={
          employee.isActive
            ? t(
                'employees.confirmDeactivate',
                'Are you sure you want to deactivate this employee? They will not be able to log in.'
              )
            : t(
                'employees.confirmActivate',
                'Are you sure you want to activate this employee account?'
              )
        }
        footer={
          <div className="flex gap-2 w-full">
            <button
              onClick={() => setShowToggleModal(false)}
              className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              onClick={handleToggleStatus}
              disabled={toggleActiveMutation.isPending}
              className={`flex-1 py-2 rounded-xl text-white text-xs font-semibold shadow ${
                employee.isActive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {toggleActiveMutation.isPending ? t('common.loading', 'Processing...') : t('common.confirm', 'Confirm')}
            </button>
          </div>
        }
      >
        <div />
      </Modal>
    </div>
  );
}
