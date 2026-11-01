'use client';

import React, { useState } from 'react';
import { Transaction, TransactionType } from '@/types';
import { format } from 'date-fns';
import { Check, X, Eye, FileText, User as UserIcon } from 'lucide-react';
import { Modal } from './Modal';
import { useLanguageStore } from '@/store/language.store';

interface ApprovalCardProps {
  transaction: Transaction;
  onApprove: (id: string) => Promise<void> | void;
  onReject: (id: string, reason: string) => Promise<void> | void;
  isApproving?: boolean;
  isRejecting?: boolean;
}

export function ApprovalCard({
  transaction,
  onApprove,
  onReject,
  isApproving = false,
  isRejecting = false,
}: ApprovalCardProps) {
  const t = useLanguageStore((state) => state.t);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const amountNum = Number(transaction.amount) || 0;
  const isIncome = transaction.type === TransactionType.INCOME;

  let formattedDate = '';
  try {
    formattedDate = format(new Date(transaction.date), 'dd MMM yyyy, hh:mm a');
  } catch (e) {
    formattedDate = transaction.date;
  }

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) return;
    onReject(transaction.id, rejectReason);
    setShowRejectModal(false);
    setRejectReason('');
  };

  return (
    <>
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all">
        {/* Top Info */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isIncome
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                }`}
              >
                {transaction.type}
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {transaction.category}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <UserIcon size={13} className="text-slate-400" />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {transaction.user?.name || 'Staff Member'}
              </span>
              {transaction.user?.employeeId && (
                <span>({transaction.user.employeeId})</span>
              )}
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p
              className={`text-base font-extrabold ${
                isIncome
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              ₹{amountNum.toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-slate-400 capitalize">
              {transaction.paymentMethod}
            </p>
          </div>
        </div>

        {/* Description & Note */}
        {transaction.description && (
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl">
            {transaction.description}
          </p>
        )}

        {/* Date and Receipt Preview */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2.5">
          <span>{formattedDate}</span>

          {transaction.receiptUrl ? (
            <button
              onClick={() => setShowReceiptModal(true)}
              className="flex items-center gap-1 text-[#2563EB] dark:text-blue-400 font-medium hover:underline"
            >
              <Eye size={14} />
              <span>{t('transactions.viewReceipt', 'Receipt')}</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">
              {t('transactions.noReceipt', 'No receipt')}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-3.5 grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={isRejecting || isApproving}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/80 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-semibold text-xs transition-colors disabled:opacity-50"
          >
            <X size={15} />
            <span>{isRejecting ? t('common.loading', 'Rejecting...') : t('common.reject', 'Reject')}</span>
          </button>

          <button
            onClick={() => onApprove(transaction.id)}
            disabled={isApproving || isRejecting}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors disabled:opacity-50"
          >
            <Check size={15} />
            <span>{isApproving ? t('common.loading', 'Approving...') : t('common.approve', 'Approve')}</span>
          </button>
        </div>
      </div>

      {/* Rejection Reason Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title={t('transactions.rejectConfirm', 'Confirm Rejection')}
        description={t(
          'transactions.enterRejectionReason',
          'Please provide a reason for rejecting this transaction.'
        )}
        footer={
          <>
            <button
              onClick={() => setShowRejectModal(false)}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              onClick={handleConfirmReject}
              disabled={!rejectReason.trim()}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg disabled:opacity-50"
            >
              {t('common.confirm', 'Confirm Reject')}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={t(
              'transactions.enterRejectionReason',
              'Enter reason for rejection...'
            )}
            rows={3}
            className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </Modal>

      {/* Receipt Image Zoom Modal */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        title={t('transactions.receipt', 'Transaction Receipt')}
      >
        {transaction.receiptUrl && (
          <div className="flex flex-col items-center justify-center">
            <img
              src={transaction.receiptUrl}
              alt="Receipt"
              className="w-full max-h-[60vh] object-contain rounded-xl border border-slate-200 dark:border-slate-700"
            />
          </div>
        )}
      </Modal>
    </>
  );
}

export default ApprovalCard;
