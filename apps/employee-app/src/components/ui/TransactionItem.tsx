'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Briefcase,
  DollarSign,
  Receipt,
  Truck,
  Building,
  Users,
  Tag,
} from 'lucide-react';
import { Transaction } from '@/types';
import StatusBadge from './StatusBadge';
import { format } from 'date-fns';

interface TransactionItemProps {
  transaction: Transaction;
  onClick?: () => void;
  showStatus?: boolean;
}

const getCategoryIcon = (categoryName?: string, type?: string) => {
  const name = categoryName?.toLowerCase() || '';
  if (name.includes('sale')) return <ShoppingBag size={18} />;
  if (name.includes('service')) return <Briefcase size={18} />;
  if (name.includes('rent') || name.includes('building')) return <Building size={18} />;
  if (name.includes('salar') || name.includes('wage')) return <Users size={18} />;
  if (name.includes('travel')) return <Truck size={18} />;
  if (name.includes('suppl') || name.includes('util')) return <Receipt size={18} />;
  if (type === 'INCOME') return <TrendingUp size={18} />;
  return <TrendingDown size={18} />;
};

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onClick,
  showStatus = true,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/history/${transaction.id}`);
    }
  };

  const isIncome = transaction.type === 'INCOME';
  const categoryName = transaction.category?.name || 'General';

  // Format date and time safely
  let formattedDate = '';
  try {
    formattedDate = format(new Date(transaction.date || transaction.createdAt), 'dd MMM yyyy, hh:mm a');
  } catch {
    formattedDate = transaction.date;
  }

  const categoryColor = isIncome ? 'var(--color-success)' : 'var(--color-danger)';
  const categoryBg = isIncome ? 'var(--color-success-light)' : 'var(--color-danger-light)';

  return (
    <div
      onClick={handleClick}
      className="bams-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 14px',
        gap: '12px',
        cursor: 'pointer',
        marginBottom: '8px',
      }}
    >
      {/* Category Icon Badge */}
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          backgroundColor: categoryBg,
          color: categoryColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {getCategoryIcon(categoryName, transaction.type)}
      </div>

      {/* Description & Date */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '2px',
          }}
        >
          <span
            style={{
              fontSize: '0.925rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {transaction.description || categoryName}
          </span>
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>{categoryName}</span>
          <span>•</span>
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Amount & Status Badge */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '4px',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            color: isIncome ? 'var(--color-success)' : 'var(--color-danger)',
          }}
        >
          {isIncome ? '+' : '-'}₹{Math.abs(transaction.amount).toLocaleString('en-IN')}
        </span>
        {showStatus && <StatusBadge status={transaction.status} size="sm" />}
      </div>
    </div>
  );
};

export default TransactionItem;
