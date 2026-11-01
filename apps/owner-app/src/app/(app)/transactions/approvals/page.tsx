'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ApprovalCard } from '@/components/ui/ApprovalCard';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import {
  usePendingApprovals,
  useApproveTransaction,
  useRejectTransaction,
  useBulkApprove,
} from '@/hooks/useApprovals';
import { useEmployees } from '@/hooks/useEmployees';
import { useLanguageStore } from '@/store/language.store';
import { CheckCircle2, ShieldCheck, CheckSquare, Square, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PendingApprovalsPage() {
  const t = useLanguageStore((state) => state.t);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: approvalsData, isLoading } = usePendingApprovals({
    userId: selectedEmployee || undefined,
    limit: 50,
  });

  const { data: employeesData } = useEmployees({ limit: 100 });
  const approveMutation = useApproveTransaction();
  const rejectMutation = useRejectTransaction();
  const bulkApproveMutation = useBulkApprove();

  const transactions = approvalsData?.data || [];
  const pendingCount = approvalsData?.total ?? transactions.length;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === transactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions.map((tx) => tx.id));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    try {
      await bulkApproveMutation.mutateAsync(selectedIds);
      setSelectedIds([]);
    } catch (err) {
      // Handled by mutation
    }
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        title={t('approvals.title', 'Pending Approvals')}
        subtitle={t('approvals.subtitle', 'Transactions waiting for owner review')}
        showBack
        rightAction={
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {pendingCount}
            </span>
          </div>
        }
      />

      {/* Filter and Bulk Action Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
        {/* Filter by Employee */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Filter size={14} className="text-slate-400 flex-shrink-0" />
          <select
            value={selectedEmployee}
            onChange={(e) => {
              setSelectedEmployee(e.target.value);
              setSelectedIds([]);
            }}
            className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
          >
            <option value="">{t('approvals.allEmployees', 'All Staff Members')}</option>
            {employeesData?.data?.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.employeeId || 'ID'})
              </option>
            ))}
          </select>
        </div>

        {/* Bulk Select / Approve */}
        {transactions.length > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleSelectAll}
              className="p-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 flex items-center gap-1"
            >
              {selectedIds.length === transactions.length ? (
                <CheckSquare size={16} className="text-[#2563EB]" />
              ) : (
                <Square size={16} />
              )}
              <span className="text-[11px] font-medium hidden sm:inline">
                {t('approvals.selectAll', 'All')}
              </span>
            </button>

            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkApprove}
                disabled={bulkApproveMutation.isPending}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow transition-all active:scale-95 disabled:opacity-50"
              >
                {bulkApproveMutation.isPending
                  ? t('common.loading', 'Approving...')
                  : `${t('common.approve', 'Approve')} (${selectedIds.length})`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Approvals List */}
      <div className="p-3 space-y-3 pb-8">
        {isLoading ? (
          <SkeletonLoader rows={3} />
        ) : transactions.length > 0 ? (
          transactions.map((tx) => (
            <div key={tx.id} className="relative">
              <div className="flex items-start gap-2">
                <button
                  onClick={() => toggleSelect(tx.id)}
                  className="mt-4 p-1 text-slate-400 hover:text-slate-600 flex-shrink-0"
                >
                  {selectedIds.includes(tx.id) ? (
                    <CheckSquare size={18} className="text-[#2563EB]" />
                  ) : (
                    <Square size={18} />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <ApprovalCard
                    transaction={tx}
                    onApprove={(id) => approveMutation.mutate(id)}
                    onReject={(id, reason) => rejectMutation.mutate({ id, reason })}
                    isApproving={approveMutation.isPending}
                    isRejecting={rejectMutation.isPending}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={CheckCircle2}
            title={t('approvals.noPending', 'All clear!')}
            description="There are currently no transactions waiting for owner approval."
          />
        )}
      </div>
    </div>
  );
}
