'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmployeeCard } from '@/components/ui/EmployeeCard';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useEmployees } from '@/hooks/useEmployees';
import { useLanguageStore } from '@/store/language.store';
import { Plus, Search, X, Users } from 'lucide-react';

export default function EmployeesPage() {
  const router = useRouter();
  const t = useLanguageStore((state) => state.t);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  const { data: employeesData, isLoading } = useEmployees({
    search: searchTerm || undefined,
    isActive: statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE',
    limit: 50,
  });

  const employees = employeesData?.data || [];

  return (
    <div className="min-h-screen relative pb-20">
      <PageHeader
        title={t('employees.title', 'Staff Management')}
        subtitle={`${employees.length} employees`}
        rightAction={
          <button
            onClick={() => router.push('/employees/add')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2563EB] text-white text-xs font-bold shadow-md hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus size={15} />
            <span>{t('employees.addEmployee', 'Add')}</span>
          </button>
        }
      />

      {/* Filter Tabs & Search */}
      <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 space-y-2.5">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t(
              'employees.searchPlaceholder',
              'Search by name or Employee ID...'
            )}
            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === filter
                  ? 'bg-[#142B4A] dark:bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {filter === 'ALL'
                ? t('common.all', 'All')
                : filter === 'ACTIVE'
                ? t('employees.active', 'Active')
                : t('employees.inactive', 'Inactive')}
            </button>
          ))}
        </div>
      </div>

      {/* Employee List */}
      <div className="p-3 space-y-3">
        {isLoading ? (
          <SkeletonLoader rows={3} />
        ) : employees.length > 0 ? (
          employees.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} />
          ))
        ) : (
          <EmptyState
            icon={Users}
            title={t('employees.noEmployeesFound', 'No employees found')}
            description="Add your first staff member to start tracking business operations collaboratively."
            actionText={t('employees.addEmployee', 'Add Staff Member')}
            onAction={() => router.push('/employees/add')}
          />
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => router.push('/employees/add')}
        aria-label="Add Employee"
        className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-gradient-to-r from-[#142B4A] to-[#2563EB] text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all"
      >
        <Plus size={22} />
      </button>
    </div>
  );
}
