'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Transaction, TransactionType, TransactionStatus } from '@/types';
import { StatusBadge } from './StatusBadge';
import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight, TrendingUp, Paperclip } from 'lucide-react';
import { useLanguageStore } from '@/store/language.store';

interface TransactionItemProps {
  transaction: Transaction;
  onClick?: () => void;
  showUser?: boolean;
}

export function TransactionItem({
  transaction,
  onClick,
  showUser = true,
}: TransactionItemProps) {
  const router = useRouter();
  const t = useLanguageStore((state) => state.t);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/transactions/${transaction.id}`);
    }
  };

  const isIncome = transaction.type === TransactionType.INCOME;
  const isExpense = transaction.type === TransactionType.EXPENSE;
  const isInvestment = transaction.type === TransactionType.INVESTMENT;

  const amountNum = Number(transaction.amount) || 0;
  const formattedAmount = `${isIncome ? '+' : isExpense ? '-' : ''}₹${amountNum.toLocaleString('en-IN')}`;

  const amountColor = isIncome
    ? 'text-emerald-600 dark:text-emerald-400'
    : isExpense
    ? 'text-rose-600 dark:text-rose-400'
    : 'text-blue-600 dark:text-blue-400';

  let dateStr = '';
  try {
    dateStr = format(new Date(transaction.date), 'dd MMM yyyy, hh:mm a');
  } catch (e) {
    dateStr = transaction.date;
  }

  // Get user initials
  const userName = transaction.user?.name || 'Staff';
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      onClick={handleClick}
      className="group relative flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-400/50 dark:hover:border-blue-500/50 shadow-sm transition-all duration-150 cursor-pointer active:scale-[0.99]"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Type / Initials Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shadow-inner ${
              isIncome
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                : isExpense
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
            }`}
          >
            {showUser && initials ? initials : isIncome ? <ArrowDownLeft size={18} /> : isExpense ? <ArrowUpRight size={18} /> : <TrendingUp size={18} />}
          </div>
          {transaction.receiptUrl && (
            <span className="absolute -bottom-1 -right-1 bg-slate-800 text-white rounded-full p-0.5 shadow">
              <Paperclip size={10} />
            </span>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 pr-2">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {transaction.category || 'General'}
            </h4>
            <StatusBadge status={transaction.status} size="sm" />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {transaction.description || (showUser ? `Recorded by ${userName}` : dateStr)}
          </p>

          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 dark:text-slate-500">
            <span>{dateStr}</span>
            <span>•</span>
            <span className="capitalize">{transaction.paymentMethod}</span>
          </div>
        </div>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0 pl-2">
        <span className={`text-sm font-bold tracking-tight ${amountColor}`}>
          {formattedAmount}
        </span>
      </div>
    </div>
  );
}

export default TransactionItem;
