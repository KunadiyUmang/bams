'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  Check,
  X,
  Eye,
  Calendar,
  CreditCard,
  User as UserIcon,
  FileText,
  Clock,
  ShieldAlert,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTransaction } from '@/hooks/useTransactions';
import { useApproveTransaction, useRejectTransaction } from '@/hooks/useApprovals';
import { useLanguageStore } from '@/store/language.store';
import { TransactionType, TransactionStatus } from '@/types';

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const t = useLanguageStore((state) => state.t);

  const { data: transaction, isLoading, error } = useTransaction(id);
  const approveMutation = useApproveTransaction();
  const rejectMutation = useRejectTransaction();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size={32} label="Loading transaction details..." />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen">
        <PageHeader title={t('transactions.transactionDetails', 'Transaction Details')} showBack />
        <div className="p-6 text-center text-rose-500 text-sm">
          Failed to load transaction details.
        </div>
      </div>
    );
  }

  const isIncome = transaction.type === TransactionType.INCOME;
  const isExpense = transaction.type === TransactionType.EXPENSE;
  const isPending = transaction.status === TransactionStatus.PENDING;
  const amountNum = Number(transaction.amount) || 0;

  let formattedDate = '';
  try {
    formattedDate = format(new Date(transaction.date), 'dd MMMM yyyy, hh:mm a');
  } catch (e) {
    formattedDate = transaction.date;
  }

  const handleApprove = async () => {
    await approveMutation.mutateAsync(transaction.id);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    await rejectMutation.mutateAsync({ id: transaction.id, reason: rejectReason });
    setShowRejectModal(false);
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        title={t('transactions.transactionDetails', 'Transaction Details')}
        showBack
      />

      <div className="p-4 space-y-4">
        {/* Main Amount Card */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
          <div className="inline-flex p-3 rounded-2xl mb-2.5 shadow-inner">
            {isIncome ? (
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center">
                <ArrowDownLeft size={24} />
              </div>
            ) : isExpense ? (
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center">
                <ArrowUpRight size={24} />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
            )}
          </div>

          <h2
            className={`text-3xl font-extrabold tracking-tight ${
              isIncome
                ? 'text-emerald-600 dark:text-emerald-400'
                : isExpense
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-blue-600 dark:text-blue-400'
            }`}
          >
            {isIncome ? '+' : isExpense ? '-' : ''}₹{amountNum.toLocaleString('en-IN')}
          </h2>

          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {transaction.category}
            </span>
            <StatusBadge status={transaction.status} />
          </div>

          {/* Pending Approval Warning */}
          {isPending && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center gap-2 text-left">
              <Clock size={18} className="text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-300">
                This transaction requires your review and approval before becoming final.
              </p>
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">{t('common.date', 'Date & Time')}</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formattedDate}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">{t('transactions.paymentMethod', 'Payment Method')}</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
              {transaction.paymentMethod}
            </span>
          </div>

          {transaction.referenceId && (
            <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">{t('transactions.referenceId', 'Ref / Txn ID')}</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">
                {transaction.referenceId}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">{t('transactions.createdBy', 'Recorded By')}</span>
            <div className="text-right">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                {transaction.user?.name || 'Staff Member'}
              </span>
              <span className="text-[10px] text-slate-400">
                {transaction.user?.employeeId || transaction.user?.email}
              </span>
            </div>
          </div>

          {transaction.description && (
            <div className="py-1">
              <span className="text-slate-400 block mb-1">
                {t('transactions.description', 'Description / Remarks')}
              </span>
              <p className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                {transaction.description}
              </p>
            </div>
          )}

          {transaction.notes && (
            <div className="py-1">
              <span className="text-slate-400 block mb-1">{t('common.notes', 'Internal Notes')}</span>
              <p className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                {transaction.notes}
              </p>
            </div>
          )}
        </div>

        {/* Receipt Image Card */}
        {transaction.receiptUrl && (
          <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t('transactions.receipt', 'Attached Receipt')}
              </h3>
              <button
                onClick={() => setShowReceiptModal(true)}
                className="text-xs text-[#2563EB] dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Eye size={13} />
                <span>Zoom</span>
              </button>
            </div>
            <div
              onClick={() => setShowReceiptModal(true)}
              className="cursor-pointer overflow-hidden rounded-2xl max-h-48 border border-slate-100 dark:border-slate-800"
            >
              <img
                src={transaction.receiptUrl}
                alt="Receipt"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        )}

        {/* Audit & Approval History */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
          <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-2">
            {t('transactions.auditTrail', 'Audit & Approval History')}
          </h3>

          {transaction.approvedAt && (
            <div className="flex items-center justify-between py-1 text-emerald-600 dark:text-emerald-400">
              <span>{t('transactions.approvedAt', 'Approved At')}</span>
              <span>
                {format(new Date(transaction.approvedAt), 'dd MMM yyyy, hh:mm a')}
              </span>
            </div>
          )}

          {transaction.rejectionReason && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
              <span className="font-semibold block mb-0.5">
                {t('transactions.rejectionReason', 'Rejection Reason')}:
              </span>
              <span>{transaction.rejectionReason}</span>
            </div>
          )}
        </div>

        {/* Pending Action Buttons */}
        {isPending && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={rejectMutation.isPending || approveMutation.isPending}
              className="py-3 px-4 rounded-2xl border border-rose-300 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-400 font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {t('common.reject', 'Reject')}
            </button>
            <button
              onClick={handleApprove}
              disabled={approveMutation.isPending || rejectMutation.isPending}
              className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {approveMutation.isPending
                ? t('common.loading', 'Approving...')
                : t('common.approve', 'Approve')}
            </button>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title={t('transactions.rejectConfirm', 'Confirm Rejection')}
        footer={
          <>
            <button
              onClick={() => setShowRejectModal(false)}
              className="px-3 py-1.5 text-xs text-slate-500"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              onClick={handleReject}
              disabled={!rejectReason.trim()}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-lg disabled:opacity-50"
            >
              {t('common.confirm', 'Reject')}
            </button>
          </>
        }
      >
        <textarea
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder={t('transactions.enterRejectionReason', 'Reason for rejection...')}
          className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </Modal>

      {/* Receipt Zoom Modal */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        title={t('transactions.receipt', 'Transaction Receipt')}
      >
        {transaction.receiptUrl && (
          <img
            src={transaction.receiptUrl}
            alt="Receipt"
            className="w-full max-h-[65vh] object-contain rounded-xl"
          />
        )}
      </Modal>
    </div>
  );
}
