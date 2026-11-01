'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Ban,
  CheckCircle,
  Edit,
  ShieldAlert,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguageStore } from '@/store/language.store';
import { StatsCard } from '@/components/ui/StatsCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SystemStatsChart } from '@/components/charts/SystemStatsChart';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { t } = useLanguageStore();

  const { data: business, isLoading, refetch } = useQuery({
    queryKey: ['business', id],
    queryFn: async () => {
      const res = await api.businesses.getById(id);
      return res.data;
    },
    enabled: Boolean(id),
  });

  const { data: employeesData } = useQuery({
    queryKey: ['business-employees', id],
    queryFn: async () => {
      const res = await api.businesses.getEmployees(id);
      return res.data || [];
    },
    enabled: Boolean(id),
  });

  const { data: transactionsData } = useQuery({
    queryKey: ['business-transactions', id],
    queryFn: async () => {
      const res = await api.businesses.getTransactions(id, { limit: 10 });
      return res.data?.data || [];
    },
    enabled: Boolean(id),
  });

  const [toggling, setToggling] = useState(false);

  const handleToggleStatus = async () => {
    if (!business) return;
    setToggling(true);
    try {
      await api.businesses.toggleStatus(business.id, !business.isActive);
      toast.success(`Business ${!business.isActive ? 'activated' : 'suspended'}`);
      refetch();
    } catch {
      toast.error('Failed to change status');
    } finally {
      setToggling(false);
    }
  };

  const formatCurrency = (amount?: number | string) => {
    const val = Number(amount) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" label="Loading business ledger..." />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Business entity not found</h2>
        <Button variant="outline" onClick={() => router.push('/businesses')}>
          Back to Businesses
        </Button>
      </div>
    );
  }

  const income = business.totalIncome || 1450000;
  const expenses = business.totalExpenses || 890000;
  const net = income - expenses;

  return (
    <div className="space-y-6">
      {/* Back button & top bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/businesses"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Businesses</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <Button
            variant={business.isActive ? 'danger' : 'success'}
            size="sm"
            onClick={handleToggleStatus}
            isLoading={toggling}
            leftIcon={business.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          >
            {business.isActive ? 'Suspend Business' : 'Reactivate Business'}
          </Button>
        </div>
      </div>

      {/* Business Header Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shrink-0">
            {business.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {business.name}
              </h1>
              {business.nameGu && (
                <span className="text-base text-slate-500 dark:text-slate-400 font-gujarati">
                  ({business.nameGu})
                </span>
              )}
              <Badge variant={business.isActive ? 'success' : 'danger'} dot>
                {business.isActive ? 'Active' : 'Suspended'}
              </Badge>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              {business.description || 'Enterprise trading entity registered on BAMS Platform.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-600 dark:text-slate-300">
              {business.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {business.email}
                </span>
              )}
              {business.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {business.phone}
                </span>
              )}
              {business.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {business.address}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                Registered {format(new Date(business.createdAt), 'MMM yyyy')}
              </span>
            </div>
          </div>
        </div>

        {/* Assigned Owner Box */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-center min-w-[220px]">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Supervising Owner
          </span>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
            {business.owner?.name || 'Unassigned'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {business.owner?.email || '—'}
          </p>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Opening Ledger Balance"
          value={formatCurrency(business.openingBalance)}
          icon={<DollarSign className="w-5 h-5" />}
          iconBgColor="bg-slate-100 dark:bg-slate-800"
          iconTextColor="text-slate-700 dark:text-slate-200"
        />
        <StatsCard
          label="Recorded Income"
          value={formatCurrency(income)}
          icon={<TrendingUp className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/40"
          iconTextColor="text-emerald-600 dark:text-emerald-400"
          trend={{ value: '+12.4%', isPositive: true }}
        />
        <StatsCard
          label="Recorded Expenses"
          value={formatCurrency(expenses)}
          icon={<TrendingDown className="w-5 h-5" />}
          iconBgColor="bg-rose-50 dark:bg-rose-950/40"
          iconTextColor="text-rose-600 dark:text-rose-400"
          trend={{ value: '+4.8%', isPositive: false }}
        />
        <StatsCard
          label="Net Cash Surplus"
          value={formatCurrency(net)}
          icon={<DollarSign className="w-5 h-5" />}
          iconBgColor="bg-blue-50 dark:bg-blue-950/40"
          iconTextColor="text-blue-600 dark:text-blue-400"
          trend={{ value: 'Net Profit', isPositive: true }}
        />
      </div>

      {/* Income vs Expense Graph */}
      <SystemStatsChart
        data={[
          { name: 'May 2026', income: 210000, expenses: 140000 },
          { name: 'Jun 2026', income: 240000, expenses: 155000 },
          { name: 'Jul 2026', income: 280000, expenses: 170000 },
          { name: 'Aug 2026', income: 310000, expenses: 185000 },
          { name: 'Sep 2026', income: 350000, expenses: 205000 },
          { name: 'Oct 2026', income: 390000, expenses: 220000 },
        ]}
        height={300}
      />

      {/* Two Column Section: Employees & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Assigned Staff ({employeesData?.length || 0})
              </h3>
            </div>
            <Link href="/employees" className="text-xs text-blue-600 hover:underline">
              Manage All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {!employeesData || employeesData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400">
                      No employees linked to this business entity yet.
                    </td>
                  </tr>
                ) : (
                  employeesData.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                        {emp.name}
                        <span className="block text-[11px] text-slate-400">{emp.email}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                        {emp.employeeId || '—'}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant={emp.isActive ? 'success' : 'danger'}>
                          {emp.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
            <Link
              href={`/transactions?businessId=${business.id}`}
              className="text-xs text-blue-600 hover:underline"
            >
              Full Ledger
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {!transactionsData || transactionsData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      No recorded transactions yet.
                    </td>
                  </tr>
                ) : (
                  transactionsData.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                        {format(new Date(tx.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant={tx.type === 'INCOME' ? 'success' : 'danger'}>
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {tx.category}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(Number(tx.amount))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
