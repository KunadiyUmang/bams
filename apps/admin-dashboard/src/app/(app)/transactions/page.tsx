'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeftRight,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useLanguageStore } from '@/store/language.store';
import {
  Transaction,
  TransactionType,
  PaymentMethod,
  TransactionStatus,
} from '@/types';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { StatsCard } from '@/components/ui/StatsCard';
import { format } from 'date-fns';

export default function TransactionsPage() {
  const { t } = useLanguageStore();
  const { businesses } = useBusinesses();

  // Filters
  const [businessId, setBusinessId] = useState('');
  const [type, setType] = useState<TransactionType | ''>('');
  const [status, setStatus] = useState<TransactionStatus | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const {
    transactions,
    isLoading,
    approveTransaction,
    rejectTransaction,
    exportTransactions,
  } = useTransactions({
    businessId: businessId || undefined,
    type: (type as TransactionType) || undefined,
    status: (status as TransactionStatus) || undefined,
    paymentMethod: (paymentMethod as PaymentMethod) || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  // Transaction details modal
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Compute summary stats for the current view
  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach((tx) => {
      const val = Number(tx.amount) || 0;
      if (tx.type === 'INCOME') income += val;
      if (tx.type === 'EXPENSE') expense += val;
    });
    return {
      income,
      expense,
      net: income - expense,
      count: transactions.length,
    };
  }, [transactions]);

  const formatCurrency = (val: number | string) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getStatusBadge = (txStatus: TransactionStatus) => {
    switch (txStatus) {
      case 'APPROVED':
        return <Badge variant="success" dot>Approved</Badge>;
      case 'PENDING':
        return <Badge variant="warning" dot>Pending</Badge>;
      case 'REJECTED':
        return <Badge variant="danger" dot>Rejected</Badge>;
      default:
        return <Badge variant="neutral">{txStatus}</Badge>;
    }
  };

  const columns: Column<Transaction>[] = [
    {
      key: 'date',
      header: 'Date & Time',
      sortable: true,
      render: (tx) => (
        <span className="text-slate-600 dark:text-slate-400 whitespace-nowrap text-xs">
          {format(new Date(tx.date), 'MMM dd, yyyy HH:mm')}
        </span>
      ),
    },
    {
      key: 'business',
      header: 'Business',
      render: (tx) => (
        <div>
          <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
            {tx.business?.name || '—'}
          </span>
          <span className="text-[11px] text-slate-400 block">
            by {tx.user?.name || 'Staff'}
          </span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (tx) => (
        <Badge variant={tx.type === 'INCOME' ? 'success' : tx.type === 'EXPENSE' ? 'danger' : 'info'}>
          {tx.type}
        </Badge>
      ),
    },
    {
      key: 'category',
      header: 'Category / Ref',
      render: (tx) => (
        <div>
          <span className="font-medium text-slate-700 dark:text-slate-300 block text-xs">
            {tx.category}
          </span>
          <span className="text-[11px] font-mono text-slate-400 block">
            {tx.referenceId || tx.paymentMethod}
          </span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      sortable: true,
      className: 'text-right',
      headerClassName: 'text-right',
      render: (tx) => (
        <span
          className={`font-bold text-sm ${
            tx.type === 'INCOME'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {tx.type === 'INCOME' ? '+' : '-'}
          {formatCurrency(tx.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (tx) => getStatusBadge(tx.status),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('transactions.title', 'Cross-Business Transactions')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('transactions.subtitle', 'Consolidated financial ledger across all operating accounts')}
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() => exportTransactions('csv')}
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
            onClick={() => exportTransactions('xlsx')}
          >
            Export Excel
          </Button>
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Filtered Income"
          value={formatCurrency(summary.income)}
          icon={<TrendingUp className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/40"
          iconTextColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatsCard
          label="Filtered Expenses"
          value={formatCurrency(summary.expense)}
          icon={<TrendingDown className="w-5 h-5" />}
          iconBgColor="bg-rose-50 dark:bg-rose-950/40"
          iconTextColor="text-rose-600 dark:text-rose-400"
        />
        <StatsCard
          label="Filtered Net Cashflow"
          value={formatCurrency(summary.net)}
          icon={<DollarSign className="w-5 h-5" />}
          iconBgColor="bg-blue-50 dark:bg-blue-950/40"
          iconTextColor="text-blue-600 dark:text-blue-400"
        />
        <StatsCard
          label="Transactions Count"
          value={summary.count}
          icon={<ArrowLeftRight className="w-5 h-5" />}
          iconBgColor="bg-indigo-50 dark:bg-indigo-950/40"
          iconTextColor="text-indigo-600 dark:text-indigo-400"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Filters:</span>
        </div>

        {/* Business Selector */}
        <select
          value={businessId}
          onChange={(e) => setBusinessId(e.target.value)}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="">All Businesses</option>
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        {/* Type Selector */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value as TransactionType | '')}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="">All Types</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
          <option value="INVESTMENT">Investment</option>
        </select>

        {/* Status Selector */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as TransactionStatus | '')}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="APPROVED">Approved</option>
          <option value="PENDING">Pending</option>
          <option value="REJECTED">Rejected</option>
        </select>

        {/* Payment Method */}
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod | '')}
          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="">All Methods</option>
          <option value="CASH">Cash</option>
          <option value="BANK">Bank</option>
          <option value="UPI">UPI</option>
          <option value="CHEQUE">Cheque</option>
          <option value="ONLINE">Online</option>
        </select>

        {/* Date Inputs */}
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
            title="Start date"
          />
          <span className="text-slate-400 text-xs">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
            title="End date"
          />
        </div>

        {(businessId || type || status || paymentMethod || dateFrom || dateTo) && (
          <button
            onClick={() => {
              setBusinessId('');
              setType('');
              setStatus('');
              setPaymentMethod('');
              setDateFrom('');
              setDateTo('');
            }}
            className="text-xs text-rose-600 hover:underline font-semibold ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={transactions}
        isLoading={isLoading}
        searchPlaceholder="Search by description, reference, or amount..."
        onView={(tx) => setSelectedTx(tx)}
        customActions={[
          {
            label: 'Approve',
            icon: <CheckCircle className="w-4 h-4 text-emerald-600" />,
            show: (tx) => tx.status === 'PENDING',
            onClick: (tx) => approveTransaction(tx.id),
          },
          {
            label: 'Reject',
            icon: <XCircle className="w-4 h-4 text-rose-600" />,
            show: (tx) => tx.status === 'PENDING',
            onClick: (tx) => rejectTransaction({ id: tx.id, reason: 'Rejected by Super Admin' }),
          },
        ]}
      />

      {/* Transaction Detail Modal */}
      <Modal
        isOpen={Boolean(selectedTx)}
        onClose={() => setSelectedTx(null)}
        title="Transaction Record Details"
        subtitle={`System ID: ${selectedTx?.id}`}
        size="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <div>
              {selectedTx?.status === 'PENDING' && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (selectedTx) {
                        rejectTransaction({ id: selectedTx.id, reason: 'Super Admin Disapproval' });
                        setSelectedTx(null);
                      }
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => {
                      if (selectedTx) {
                        approveTransaction(selectedTx.id);
                        setSelectedTx(null);
                      }
                    }}
                  >
                    Approve
                  </Button>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedTx(null)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedTx && (
          <div className="space-y-4 text-xs">
            {/* Header Amount */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  Transaction Amount
                </span>
                <p
                  className={`text-2xl font-black ${
                    selectedTx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {selectedTx.type === 'INCOME' ? '+' : '-'}
                  {formatCurrency(selectedTx.amount)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  Status
                </span>
                <div className="mt-1">{getStatusBadge(selectedTx.status)}</div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-400 font-medium">Business:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedTx.business?.name || '—'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Recorded By:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedTx.user?.name || '—'} ({selectedTx.user?.email || 'Staff'})
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Category:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedTx.category}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Payment Method:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedTx.paymentMethod}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Reference / Cheque:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                  {selectedTx.referenceId || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Date & Time:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {format(new Date(selectedTx.date), 'PPP pp')}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-slate-400 font-medium">Description (English):</span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedTx.description}
              </p>
              {selectedTx.descriptionGu && (
                <>
                  <span className="text-slate-400 font-medium block pt-2">
                    Description (Gujarati):
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 font-gujarati leading-relaxed">
                    {selectedTx.descriptionGu}
                  </p>
                </>
              )}
            </div>

            {/* Receipt Attachment preview if available */}
            {selectedTx.receiptUrl && (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                  Attached Voucher / Receipt
                </span>
                <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 max-h-60 flex items-center justify-center bg-slate-100 dark:bg-slate-850">
                  <img
                    src={selectedTx.receiptUrl}
                    alt="Receipt"
                    className="max-h-60 object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
