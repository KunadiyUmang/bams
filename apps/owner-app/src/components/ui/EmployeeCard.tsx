'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { StatusBadge } from './StatusBadge';
import { ChevronRight, Phone, Mail, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useLanguageStore } from '@/store/language.store';

interface EmployeeCardProps {
  employee: User & {
    totalIncome?: number;
    totalExpenses?: number;
    transactionCount?: number;
  };
  onClick?: () => void;
}

export function EmployeeCard({ employee, onClick }: EmployeeCardProps) {
  const router = useRouter();
  const t = useLanguageStore((state) => state.t);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/employees/${employee.id}`);
    }
  };

  const initials = employee.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const income = employee.totalIncome || 0;
  const expense = employee.totalExpenses || 0;
  const count = employee.transactionCount || 0;

  return (
    <div
      onClick={handleClick}
      className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-400/50 shadow-sm transition-all duration-150 cursor-pointer active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#142B4A] to-[#2563EB] text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0">
            {employee.profilePhoto ? (
              <img
                src={employee.profilePhoto}
                alt={employee.name}
                className="w-full h-full rounded-2xl object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {employee.name}
              </h3>
              <StatusBadge status={employee.isActive ? 'ACTIVE' : 'INACTIVE'} size="sm" />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>{employee.employeeId || 'EMP-#'}</span>
              {employee.phone && (
                <>
                  <span>•</span>
                  <span>{employee.phone}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <ChevronRight size={18} className="text-slate-400 mt-1 flex-shrink-0" />
      </div>

      {/* Mini KPIs */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl text-center">
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {t('employees.totalIncome', 'Income')}
          </p>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate mt-0.5">
            ₹{income.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl text-center">
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {t('employees.totalExpenses', 'Expenses')}
          </p>
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400 truncate mt-0.5">
            ₹{expense.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl text-center">
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {t('employees.totalTransactions', 'Txns')}
          </p>
          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 truncate mt-0.5">
            {count}
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmployeeCard;
