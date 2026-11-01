'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Tag,
  CreditCard,
  User,
  Hash,
  FileText,
  Trash2,
  Edit3,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Save,
} from 'lucide-react';
import { format } from 'date-fns';
import PageHeader from '@/components/layout/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useLanguageStore } from '@/store/language.store';
import {
  useTransaction,
  useDeleteTransaction,
  useUpdateTransaction,
} from '@/hooks/useTransactions';

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { t } = useLanguageStore();

  const { data: transaction, isLoading, isError } = useTransaction(id);
  const deleteMutation = useDeleteTransaction();
  const updateMutation = useUpdateTransaction();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form state
  const [editAmount, setEditAmount] = useState<number | string>('');
  const [editDescription, setEditDescription] = useState('');

  const openEditModal = () => {
    if (!transaction) return;
    setEditAmount(transaction.amount);
    setEditDescription(transaction.description);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!transaction) return;
    await updateMutation.mutateAsync({
      id: transaction.id,
      data: {
        amount: Number(editAmount),
        description: editDescription,
      },
    });
    setIsEditModalOpen(false);
  };

  const handleDelete = async () => {
    if (!transaction) return;
    await deleteMutation.mutateAsync(transaction.id);
    setIsDeleteModalOpen(false);
    router.push('/history');
  };

  if (isLoading) {
    return (
      <div style={{ width: '100%' }}>
        <PageHeader title="Transaction Detail" showBack onBack={() => router.back()} />
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <LoadingSpinner size="lg" label="Loading transaction details..." />
        </div>
      </div>
    );
  }

  if (isError || !transaction) {
    return (
      <div style={{ width: '100%' }}>
        <PageHeader title="Transaction Detail" showBack onBack={() => router.back()} />
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-danger)', marginBottom: '16px' }}>
            Transaction not found or could not be loaded.
          </p>
          <button type="button" onClick={() => router.back()} className="btn btn-outline">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isIncome = transaction.type === 'INCOME';
  const isPending = transaction.status === 'PENDING';

  let formattedDate = transaction.date;
  try {
    formattedDate = format(new Date(transaction.date || transaction.createdAt), 'EEEE, dd MMMM yyyy, hh:mm a');
  } catch {
    // Keep raw date
  }

  return (
    <div style={{ width: '100%' }}>
      <PageHeader
        title={t('history.detail_title') || 'Transaction Detail'}
        showBack
        onBack={() => router.back()}
        rightAction={
          isPending ? (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={openEditModal}
                aria-label="Edit transaction"
                className="btn btn-ghost"
                style={{ padding: '8px', borderRadius: '50%' }}
              >
                <Edit3 size={18} />
              </button>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                aria-label="Delete transaction"
                className="btn btn-ghost"
                style={{ padding: '8px', borderRadius: '50%', color: 'var(--color-danger)' }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ) : undefined
        }
      />

      <div style={{ padding: '16px' }}>
        {/* Main Banner Card */}
        <div
          className="bams-card"
          style={{
            textAlign: 'center',
            padding: '24px 16px',
            marginBottom: '16px',
            backgroundColor: isIncome ? 'var(--color-success-light)' : 'var(--color-danger-light)',
            borderColor: isIncome ? 'rgba(22, 163, 74, 0.3)' : 'rgba(220, 38, 38, 0.3)',
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              margin: '0 auto 12px',
              backgroundColor: isIncome ? 'var(--color-success)' : 'var(--color-danger)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isIncome ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
          </div>

          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: isIncome ? 'var(--color-success-dark)' : 'var(--color-danger-dark)',
              display: 'block',
              marginBottom: '4px',
            }}
          >
            {isIncome ? 'Income' : 'Expense'}
          </span>

          <h2
            style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              color: isIncome ? 'var(--color-success-dark)' : 'var(--color-danger-dark)',
              letterSpacing: '-0.02em',
              marginBottom: '12px',
            }}
          >
            {isIncome ? '+' : '-'}₹{Math.abs(transaction.amount).toLocaleString('en-IN')}
          </h2>

          <div style={{ display: 'inline-flex' }}>
            <StatusBadge status={transaction.status} size="md" />
          </div>
        </div>

        {/* Rejection / Note Banner */}
        {transaction.status === 'REJECTED' && transaction.rejectionReason && (
          <div
            className="bams-card"
            style={{
              backgroundColor: 'var(--color-danger-light)',
              borderColor: 'rgba(220, 38, 38, 0.4)',
              padding: '12px 14px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <AlertTriangle size={20} color="var(--color-danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--color-danger-dark)', fontWeight: 700 }}>
                {t('history.rejection_reason') || 'Rejection Reason'}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-danger-dark)', marginTop: '2px' }}>
                {transaction.rejectionReason}
              </p>
            </div>
          </div>
        )}

        {/* Transaction Detail Attributes */}
        <div className="bams-card" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px' }}>
            General Details
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={15} />
                <span>Description</span>
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', textAlign: 'right' }}>
                {transaction.description}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Tag size={15} />
                <span>Category</span>
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {transaction.category?.name || 'General'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} />
                <span>Date & Time</span>
              </span>
              <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)', textAlign: 'right' }}>
                {formattedDate}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CreditCard size={15} />
                <span>Payment Method</span>
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {transaction.paymentMethod}
              </span>
            </div>

            {transaction.customer && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={15} />
                  <span>{isIncome ? 'Customer' : 'Vendor'}</span>
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {transaction.customer}
                </span>
              </div>
            )}

            {transaction.reference && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Hash size={15} />
                  <span>Reference #</span>
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {transaction.reference}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Approval Details (if approved) */}
        {transaction.status === 'APPROVED' && (
          <div className="bams-card" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={18} color="var(--color-success)" />
              <span>{t('history.approval_info') || 'Approval Information'}</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t('history.approved_by') || 'Approved By'}:</span>
                <span style={{ fontWeight: 600 }}>{transaction.approvedBy?.name || 'Manager / Admin'}</span>
              </div>
              {transaction.approvedAt && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{t('history.approved_at') || 'Approved On'}:</span>
                  <span style={{ fontWeight: 600 }}>
                    {format(new Date(transaction.approvedAt), 'dd MMM yyyy, hh:mm a')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Attached Proof / Receipt Image */}
        {transaction.attachmentUrl && (
          <div className="bams-card" style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>
              Attached Receipt / Bill
            </h3>
            <div
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                maxHeight: '260px',
              }}
            >
              <img
                src={transaction.attachmentUrl}
                alt="Receipt attachment"
                style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: 'var(--bg-card-subtle)' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Transaction"
      >
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-danger-light)',
              color: 'var(--color-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
            }}
          >
            <Trash2 size={26} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
            {t('history.delete_confirm') || 'Delete this transaction?'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            This action cannot be undone. This pending transaction will be permanently removed.
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="btn btn-outline"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="btn btn-danger"
              style={{ flex: 1 }}
            >
              {deleteMutation.isPending ? <LoadingSpinner size="sm" /> : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal (Only for Pending transactions) */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Transaction"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Amount (₹)</label>
            <input
              type="number"
              step="any"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Description</label>
            <textarea
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="btn btn-outline"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={updateMutation.isPending}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {updateMutation.isPending ? <LoadingSpinner size="sm" /> : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
