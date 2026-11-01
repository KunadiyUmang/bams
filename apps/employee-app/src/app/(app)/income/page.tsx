'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import {
  TrendingUp,
  Camera,
  Upload,
  Calendar,
  Clock,
  Tag,
  CreditCard,
  FileText,
  User,
  Hash,
  X,
  CheckCircle,
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useLanguageStore } from '@/store/language.store';
import { useCategories, useCreateTransaction } from '@/hooks/useTransactions';
import { api } from '@/lib/api';
import { PaymentMethod } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const incomeSchema = z.object({
  amount: z.coerce.number().positive('Please enter an amount greater than 0'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  categoryId: z.string().min(1, 'Please select a category'),
  paymentMethod: z.enum(['CASH', 'UPI', 'ONLINE', 'BANK', 'CHEQUE'] as const),
  description: z.string().min(2, 'Please enter a description'),
  customer: z.string().optional(),
  reference: z.string().optional(),
});

type IncomeFormData = z.infer<typeof incomeSchema>;

export default function AddIncomePage() {
  const router = useRouter();
  const { t, language } = useLanguageStore();

  const { data: categories = [], isLoading: isLoadingCategories } = useCategories('INCOME');
  const createMutation = useCreateTransaction();

  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const now = new Date();
  const defaultDate = format(now, 'yyyy-MM-dd');
  const defaultTime = format(now, 'HH:mm');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      amount: '' as any,
      date: defaultDate,
      time: defaultTime,
      categoryId: '',
      paymentMethod: 'CASH',
      description: '',
      customer: '',
      reference: '',
    },
  });

  const selectedPaymentMethod = watch('paymentMethod');

  // Handle Receipt Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }

    // Local preview for image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setAttachmentPreview(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAttachmentPreview('/icons/pdf-icon.png');
    }

    try {
      setIsUploading(true);
      const res = await api.uploads.uploadFile(file, 'income_receipt');
      setAttachmentUrl(res.url);
      toast.success('Receipt attached');
    } catch (err: any) {
      console.warn('Upload API failed, using local preview for offline demo', err);
      setAttachmentUrl(URL.createObjectURL(file));
      toast.success('Receipt attached locally');
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = () => {
    setAttachmentUrl(null);
    setAttachmentPreview(null);
  };

  const onSubmit = async (data: IncomeFormData) => {
    const combinedDateTime = `${data.date}T${data.time}:00`;

    try {
      await createMutation.mutateAsync({
        type: 'INCOME',
        amount: data.amount,
        date: combinedDateTime,
        categoryId: data.categoryId,
        paymentMethod: data.paymentMethod,
        description: data.description,
        customer: data.customer,
        reference: data.reference,
        attachmentUrl: attachmentUrl || undefined,
      });

      router.push('/dashboard');
    } catch (err) {
      console.error('Error saving income:', err);
    }
  };

  const paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'CASH', label: t('payment_methods.Cash') || 'Cash' },
    { value: 'UPI', label: t('payment_methods.UPI') || 'UPI' },
    { value: 'ONLINE', label: t('payment_methods.Online') || 'Online' },
    { value: 'BANK', label: t('payment_methods.Bank') || 'Bank' },
    { value: 'CHEQUE', label: t('payment_methods.Cheque') || 'Cheque' },
  ];

  return (
    <div style={{ width: '100%' }}>
      <PageHeader
        title={t('income.add_income') || 'Add Income'}
        subtitle="Record new cash inflow"
        showBack
        onBack={() => router.back()}
      />

      <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '16px' }}>
        {/* Large Amount Input Card */}
        <div
          className="bams-card"
          style={{
            marginBottom: '16px',
            backgroundColor: 'var(--color-success-light)',
            borderColor: 'rgba(22, 163, 74, 0.3)',
            padding: '20px 16px',
          }}
        >
          <label
            style={{
              fontSize: '0.825rem',
              fontWeight: 700,
              color: 'var(--color-success-dark)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'block',
              marginBottom: '6px',
            }}
          >
            {t('income.amount') || 'Income Amount'} *
          </label>
          <div className="currency-input-wrapper">
            <span className="currency-symbol" style={{ color: 'var(--color-success-dark)' }}>
              ₹
            </span>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              autoFocus
              {...register('amount')}
              className={`form-input currency-input ${errors.amount ? 'has-error' : ''}`}
              style={{
                color: 'var(--color-success-dark)',
                borderColor: errors.amount ? 'var(--color-danger)' : 'rgba(22, 163, 74, 0.4)',
                backgroundColor: 'var(--bg-card)',
              }}
            />
          </div>
          {errors.amount && (
            <span className="form-error-text" style={{ marginTop: '6px', display: 'block' }}>
              {errors.amount.message}
            </span>
          )}
        </div>

        {/* Date & Time Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              <Calendar size={14} />
              <span>{t('income.date') || 'Date'}</span>
              <span className="required">*</span>
            </label>
            <input
              type="date"
              {...register('date')}
              className={`form-input ${errors.date ? 'has-error' : ''}`}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              <Clock size={14} />
              <span>{t('income.time') || 'Time'}</span>
              <span className="required">*</span>
            </label>
            <input
              type="time"
              {...register('time')}
              className={`form-input ${errors.time ? 'has-error' : ''}`}
            />
          </div>
        </div>

        {/* Category Select */}
        <div className="form-group">
          <label className="form-label">
            <Tag size={14} />
            <span>{t('income.category') || 'Income Category'}</span>
            <span className="required">*</span>
          </label>
          <select
            {...register('categoryId')}
            className={`form-select ${errors.categoryId ? 'has-error' : ''}`}
          >
            <option value="">{t('income.select_category') || '-- Select category --'}</option>
            {isLoadingCategories ? (
              <option disabled>Loading categories...</option>
            ) : categories.length > 0 ? (
              categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {language === 'gu' && c.nameGu ? c.nameGu : c.name}
                </option>
              ))
            ) : (
              <>
                <option value="cat-sales">{t('categories.Sales') || 'Sales'}</option>
                <option value="cat-service">{t('categories.Service') || 'Service'}</option>
                <option value="cat-invest">{t('categories.Investment Returns') || 'Investment Returns'}</option>
                <option value="cat-other">{t('categories.Other Income') || 'Other Income'}</option>
              </>
            )}
          </select>
          {errors.categoryId && (
            <span className="form-error-text">{errors.categoryId.message}</span>
          )}
        </div>

        {/* Payment Method Selector Pills */}
        <div className="form-group">
          <label className="form-label">
            <CreditCard size={14} />
            <span>{t('income.payment_method') || 'Payment Method'}</span>
            <span className="required">*</span>
          </label>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '4px',
            }}
          >
            {paymentMethods.map((pm) => {
              const isSelected = selectedPaymentMethod === pm.value;
              return (
                <button
                  type="button"
                  key={pm.value}
                  onClick={() => setValue('paymentMethod', pm.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '20px',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    border: isSelected
                      ? '1.5px solid var(--color-success)'
                      : '1.5px solid var(--border-color)',
                    backgroundColor: isSelected ? 'var(--color-success-light)' : 'var(--bg-card)',
                    color: isSelected ? 'var(--color-success-dark)' : 'var(--text-main)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {pm.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description Textarea */}
        <div className="form-group">
          <label className="form-label">
            <FileText size={14} />
            <span>{t('income.description') || 'Description'}</span>
            <span className="required">*</span>
          </label>
          <textarea
            rows={3}
            placeholder={t('income.description_placeholder') || 'e.g. Cash sale for product delivery'}
            {...register('description')}
            className={`form-textarea ${errors.description ? 'has-error' : ''}`}
          />
          {errors.description && (
            <span className="form-error-text">{errors.description.message}</span>
          )}
        </div>

        {/* Customer & Reference Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              <User size={14} />
              <span>{t('income.customer') || 'Customer Name'}</span>
            </label>
            <input
              type="text"
              placeholder={t('income.customer_placeholder') || 'e.g. Rajesh Shah'}
              {...register('customer')}
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              <Hash size={14} />
              <span>{t('income.reference') || 'Invoice / Ref #'}</span>
            </label>
            <input
              type="text"
              placeholder={t('income.reference_placeholder') || 'e.g. INV-1002'}
              {...register('reference')}
              className="form-input"
            />
          </div>
        </div>

        {/* Attachment Upload Card */}
        <div className="bams-card" style={{ marginBottom: '24px' }}>
          <label className="form-label" style={{ marginBottom: '8px' }}>
            <Camera size={16} />
            <span>{t('income.attachment') || 'Receipt / Document Proof'}</span>
          </label>

          {attachmentPreview ? (
            <div
              style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                maxHeight: '160px',
                border: '1px solid var(--border-color)',
              }}
            >
              <img
                src={attachmentPreview}
                alt="Receipt preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                type="button"
                onClick={removeAttachment}
                aria-label="Remove attachment"
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.65)',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                backgroundColor: 'var(--bg-card-subtle)',
              }}
            >
              <input
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              {isUploading ? (
                <LoadingSpinner size="sm" label={t('income.uploading_file') || 'Uploading...'} />
              ) : (
                <>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(22, 163, 74, 0.1)',
                      color: 'var(--color-success)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Upload size={20} />
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {t('income.attachment_hint') || 'Upload receipt or take a photo'}
                  </span>
                </>
              )}
            </label>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={createMutation.isPending || isUploading}
          className="btn btn-success btn-block btn-lg"
        >
          {createMutation.isPending ? (
            <>
              <LoadingSpinner size="sm" />
              <span>{t('income.saving') || 'Recording Income...'}</span>
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              <span>{t('income.save') || 'Record Income'}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
