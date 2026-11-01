'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Download,
  Plus,
  Calendar,
  X,
  Check,
  ChevronDown,
  Clock,
  Layers,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { TransactionItem } from '@/components/ui/TransactionItem';
import { ApprovalCard } from '@/components/ui/ApprovalCard';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useTransactions } from '@/hooks/useTransactions';
import { useApproveTransaction, useRejectTransaction } from '@/hooks/useApprovals';
import { useEmployees } from '@/hooks/useEmployees';
import { useLanguageStore } from '@/store/language.store';
import { TransactionType, TransactionStatus, PaymentMethod, Transaction } from '@/types';
import { format } from 'date-fns';

type TabType = 'ALL' | 'INCOME' | 'EXPENSE' | 'INVESTMENT' | 'PENDING';

export default function TransactionsPage() {
  const router = useRouter();
  const t = useLanguageStore((state) => state.t);

  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [page, setPage] = useState(1);

  // Queries
  const typeFilter =
    activeTab === 'INCOME'
      ? TransactionType.INCOME
      : activeTab === 'EXPENSE'
      ? TransactionType.EXPENSE
      : activeTab === 'INVESTMENT'
      ? TransactionType.INVESTMENT
      : undefined;

  const statusFilter =
    activeTab === 'PENDING' ? TransactionStatus.PENDING : undefined;

  const { data: txData, isLoading } = useTransactions({
    search: searchTerm || undefined,
    type: typeFilter,
    status: statusFilter,
    userId: selectedEmployee || undefined,
    paymentMethod: (selectedPaymentMethod as PaymentMethod) || undefined,
    page,
    limit: 30,
  });

  const { data: employeesData } = useEmployees({ limit: 100 });
  const approveMutation = useApproveTransaction();
  const rejectMutation = useRejectTransaction();

  const transactions = txData?.data || [];

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    transactions.forEach((tx) => {
      let dateKey = 'Recent';
      try {
        dateKey = format(new Date(tx.date), 'dd MMMM yyyy');
      } catch (e) {
        dateKey = tx.date;
      }
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(tx);
    });
    return groups;
  }, [transactions]);

  const handleExport = () => {
    router.push('/reports');
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'ALL', label: t('transactions.all', 'All') },
    { key: 'INCOME', label: t('transactions.income', 'Income') },
    { key: 'EXPENSE', label: t('transactions.expense', 'Expense') },
    { key: 'INVESTMENT', label: t('transactions.investment', 'Investment') },
    { key: 'PENDING', label: t('transactions.pending', 'Pending') },
  ];

  return (
    <div className="min-h-screen">
      <PageHeader
        title={t('transactions.title', 'Transactions')}
        rightAction={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Export Reports"
            >
              <Download size={18} />
            </button>
            <button
              onClick={() => setShowFilterModal(true)}
              className={`p-2 rounded-xl border transition-colors ${
                selectedEmployee || selectedPaymentMethod
                  ? 'bg-blue-50 border-blue-300 text-[#2563EB] dark:bg-blue-950 dark:border-blue-700 dark:text-blue-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Filter size={18} />
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex gap-1.5 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-[#142B4A] dark:bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="p-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('transactions.searchPlaceholder', 'Search transactions, notes, ref...')}
            className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="px-3 pb-6 space-y-4">
        {isLoading ? (
          <SkeletonLoader rows={4} />
        ) : Object.keys(groupedTransactions).length > 0 ? (
          Object.entries(groupedTransactions).map(([dateLabel, items]) => (
            <div key={dateLabel} className="space-y-2">
              <div className="flex items-center gap-2 pt-2">
                <Calendar size={13} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {dateLabel}
                </span>
                <span className="text-[10px] text-slate-400">
                  ({items.length})
                </span>
              </div>

              <div className="space-y-2">
                {items.map((tx) =>
                  tx.status === TransactionStatus.PENDING ? (
                    <ApprovalCard
                      key={tx.id}
                      transaction={tx}
                      onApprove={(id) => approveMutation.mutate(id)}
                      onReject={(id, reason) =>
                        rejectMutation.mutate({ id, reason })
                      }
                      isApproving={approveMutation.isPending}
                      isRejecting={rejectMutation.isPending}
                    />
                  ) : (
                    <TransactionItem key={tx.id} transaction={tx} />
                  )
                )}
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            title={t('transactions.noTransactionsFound', 'No transactions found')}
            description="Try modifying search keywords or clearing active filters."
          />
        )}

        {/* Pagination controls */}
        {txData && txData.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-slate-500">
              Page {page} of {txData.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(txData.totalPages, p + 1))}
              disabled={page >= txData.totalPages}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title={t('transactions.filterBy', 'Filter Transactions')}
        footer={
          <div className="flex gap-2 w-full">
            <button
              onClick={() => {
                setSelectedEmployee('');
                setSelectedPaymentMethod('');
                setShowFilterModal(false);
              }}
              className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400"
            >
              Reset All
            </button>
            <button
              onClick={() => setShowFilterModal(false)}
              className="flex-1 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-semibold shadow"
            >
              Apply Filter
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Employee / Staff
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">All Staff Members</option>
              {employeesData?.data?.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.employeeId || 'ID'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              {t('transactions.paymentMethod', 'Payment Method')}
            </label>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">All Payment Methods</option>
              <option value={PaymentMethod.CASH}>Cash</option>
              <option value={PaymentMethod.UPI}>UPI</option>
              <option value={PaymentMethod.BANK}>Bank Transfer</option>
              <option value={PaymentMethod.ONLINE}>Online / Card</option>
              <option value={PaymentMethod.CHEQUE}>Cheque</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
