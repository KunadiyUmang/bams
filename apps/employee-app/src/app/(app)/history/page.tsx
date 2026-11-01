'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  Calendar,
  X,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import PageHeader from '@/components/layout/PageHeader';
import TransactionItem from '@/components/ui/TransactionItem';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import { useLanguageStore } from '@/store/language.store';
import { useTransactions, useCategories } from '@/hooks/useTransactions';
import { Transaction, TransactionType, TransactionStatus } from '@/types';

export default function HistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguageStore();

  const initialType = (searchParams.get('type') as TransactionType) || 'ALL';
  const initialStatus = (searchParams.get('status') as TransactionStatus) || 'ALL';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'ALL'>(initialType);
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatus | 'ALL'>(initialStatus);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data: categories = [] } = useCategories();

  const { data, isLoading, isFetching } = useTransactions({
    search: searchTerm || undefined,
    type: selectedType !== 'ALL' ? selectedType : undefined,
    status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
    categoryId: selectedCategory !== 'ALL' ? selectedCategory : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    limit: 30,
  });

  const transactions = data?.items || [];
  const totalCount = data?.total || transactions.length;

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: { [dateLabel: string]: Transaction[] } = {};

    transactions.forEach((tx) => {
      let dateLabel = '';
      try {
        const d = new Date(tx.date || tx.createdAt);
        if (isToday(d)) {
          dateLabel = 'Today';
        } else if (isYesterday(d)) {
          dateLabel = 'Yesterday';
        } else {
          dateLabel = format(d, 'dd MMMM yyyy');
        }
      } catch {
        dateLabel = 'Other';
      }

      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(tx);
    });

    return groups;
  }, [transactions]);

  const activeFiltersCount = [
    selectedType !== 'ALL',
    selectedStatus !== 'ALL',
    selectedCategory !== 'ALL',
    !!startDate,
    !!endDate,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSelectedType('ALL');
    setSelectedStatus('ALL');
    setSelectedCategory('ALL');
    setStartDate('');
    setEndDate('');
    setIsFilterModalOpen(false);
  };

  return (
    <div style={{ width: '100%' }}>
      <PageHeader
        title={t('history.transaction_history') || 'Transaction History'}
        subtitle={t('history.total_records', { count: totalCount }) || `${totalCount} records`}
        rightAction={
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            aria-label="Filter"
            className="btn btn-ghost"
            style={{
              position: 'relative',
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: activeFiltersCount > 0 ? 'var(--color-secondary-light)' : 'transparent',
              color: activeFiltersCount > 0 ? 'var(--color-secondary)' : 'var(--text-main)',
            }}
          >
            <SlidersHorizontal size={20} />
            {activeFiltersCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-secondary)',
                }}
              />
            )}
          </button>
        }
      />

      <div style={{ padding: '16px' }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-subtle)',
            }}
          />
          <input
            type="text"
            placeholder={t('history.search') || 'Search transactions by note, customer...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '40px', paddingRight: searchTerm ? '38px' : '14px' }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-subtle)',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Quick Filter Horizontal Scroll Pills */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '8px',
            marginBottom: '12px',
          }}
        >
          {/* Type filters */}
          <button
            type="button"
            onClick={() => setSelectedType(selectedType === 'ALL' ? 'INCOME' : selectedType === 'INCOME' ? 'EXPENSE' : 'ALL')}
            className={`btn btn-sm ${selectedType !== 'ALL' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: '20px' }}
          >
            {selectedType === 'ALL'
              ? 'All Types'
              : selectedType === 'INCOME'
              ? 'Income Only'
              : 'Expense Only'}
            <ChevronDown size={14} />
          </button>

          {/* Status filters */}
          <button
            type="button"
            onClick={() => setSelectedStatus(selectedStatus === 'ALL' ? 'PENDING' : selectedStatus === 'PENDING' ? 'APPROVED' : selectedStatus === 'APPROVED' ? 'REJECTED' : 'ALL')}
            className={`btn btn-sm ${selectedStatus !== 'ALL' ? 'btn-primary' : 'btn-outline'}`}
            style={{ borderRadius: '20px' }}
          >
            {selectedStatus === 'ALL'
              ? 'All Statuses'
              : selectedStatus}
            <ChevronDown size={14} />
          </button>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="btn btn-sm btn-ghost"
              style={{ color: 'var(--color-danger)', fontSize: '0.775rem' }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton" style={{ height: '68px', width: '100%' }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && transactions.length === 0 && (
          <div style={{ marginTop: '24px' }}>
            <EmptyState
              title={t('history.no_transactions') || 'No transactions found'}
              description={t('history.no_transactions_desc') || 'Try adjusting your search or filters'}
              actionLabel="Reset Filters"
              onAction={resetFilters}
            />
          </div>
        )}

        {/* Grouped Transaction List */}
        {!isLoading && transactions.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(groupedTransactions).map(([dateLabel, items]) => (
              <div key={dateLabel}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    paddingLeft: '4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {dateLabel}
                  </span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
                </div>

                <div>
                  {items.map((tx) => (
                    <TransactionItem
                      key={tx.id}
                      transaction={tx}
                      onClick={() => router.push(`/history/${tx.id}`)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filter Transactions"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Type Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Transaction Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="form-select"
            >
              <option value="ALL">All Types</option>
              <option value="INCOME">Income Only</option>
              <option value="EXPENSE">Expense Only</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Approval Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="form-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={resetFilters}
              className="btn btn-outline"
              style={{ flex: 1 }}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(false)}
              className="btn btn-primary"
              style={{ flex: 2 }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
