'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Share2,
  Printer,
  Calendar,
  Filter,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Wallet,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { KPICard } from '@/components/ui/KPICard';
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart';
import { CategoryChart } from '@/components/charts/CategoryChart';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { useReportSummary, useDownloadReport } from '@/hooks/useReports';
import { useEmployees } from '@/hooks/useEmployees';
import { useLanguageStore } from '@/store/language.store';
import { useAuthStore } from '@/store/auth.store';
import { TransactionType, ReportFormat } from '@/types';
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
} from 'date-fns';
import toast from 'react-hot-toast';

type PresetPeriod = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_MONTH' | 'CUSTOM';
type AnalyticsPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export default function ReportsPage() {
  const t = useLanguageStore((state) => state.t);
  const { user } = useAuthStore();
  const businessName = user?.business?.name || 'Business Account';

  // Filters State
  const [scope, setScope] = useState<'BUSINESS' | 'EMPLOYEE'>('BUSINESS');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [periodPreset, setPeriodPreset] = useState<PresetPeriod>('THIS_MONTH');
  const [startDate, setStartDate] = useState(
    format(startOfMonth(new Date()), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(
    format(endOfMonth(new Date()), 'yyyy-MM-dd')
  );
  const [reportType, setReportType] = useState<string>('ALL');
  const [analyticsTab, setAnalyticsTab] = useState<AnalyticsPeriod>('DAILY');

  // Queries
  const { data: employeesData } = useEmployees({ limit: 100 });
  const downloadReportMutation = useDownloadReport();

  const handlePeriodChange = (preset: PresetPeriod) => {
    setPeriodPreset(preset);
    const today = new Date();

    if (preset === 'TODAY') {
      const formatted = format(today, 'yyyy-MM-dd');
      setStartDate(formatted);
      setEndDate(formatted);
    } else if (preset === 'THIS_WEEK') {
      setStartDate(format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
      setEndDate(format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
    } else if (preset === 'THIS_MONTH') {
      setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'));
      setEndDate(format(endOfMonth(today), 'yyyy-MM-dd'));
    } else if (preset === 'LAST_MONTH') {
      const lastMonth = subMonths(today, 1);
      setStartDate(format(startOfMonth(lastMonth), 'yyyy-MM-dd'));
      setEndDate(format(endOfMonth(lastMonth), 'yyyy-MM-dd'));
    }
  };

  const reportFilters = useMemo(
    () => ({
      dateFrom: startDate,
      dateTo: endDate,
      userId: scope === 'EMPLOYEE' && selectedEmployee ? selectedEmployee : undefined,
      type:
        reportType === 'INCOME'
          ? TransactionType.INCOME
          : reportType === 'EXPENSE'
          ? TransactionType.EXPENSE
          : undefined,
    }),
    [startDate, endDate, scope, selectedEmployee, reportType]
  );

  const { data: summary, isLoading } = useReportSummary(reportFilters);

  // Financial Calculations
  const openingBalance = summary?.openingBalance ?? 0;
  const totalIncome = summary?.totalIncome ?? 0;
  const totalExpenses = summary?.totalExpenses ?? 0;
  const totalInvestment = summary?.totalInvestment ?? 0;
  const netProfit = summary?.netProfit ?? totalIncome - totalExpenses;
  const closingBalance =
    summary?.closingBalance ?? openingBalance + totalIncome - totalExpenses;
  const transactionCount = summary?.transactionCount ?? 0;

  // Downloads
  const handleExport = (formatType: 'pdf' | 'docx' | 'xlsx' | 'csv') => {
    downloadReportMutation.mutate({
      format: formatType,
      params: {
        ...reportFilters,
        format: formatType as ReportFormat,
      },
    });
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `📊 *BAMS Financial Summary: ${businessName}*\n` +
        `📅 Period: ${startDate} to ${endDate}\n` +
        `-----------------------------\n` +
        `💰 Total Income: ₹${totalIncome.toLocaleString('en-IN')}\n` +
        `💸 Total Expenses: ₹${totalExpenses.toLocaleString('en-IN')}\n` +
        `📈 Net Profit/Loss: ₹${netProfit.toLocaleString('en-IN')}\n` +
        `🏦 Closing Balance: ₹${closingBalance.toLocaleString('en-IN')}\n` +
        `📝 Total Transactions: ${transactionCount}\n\n` +
        `Generated via BAMS Owner App`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen pb-16">
      <PageHeader
        title={t('reports.title', 'Reports & Analytics')}
        subtitle={t('reports.downloadCenter', 'Download Center')}
      />

      <div className="p-4 space-y-6">
        {/* SECTION 1: REPORT FILTERS */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Filter size={14} className="text-[#2563EB]" />
              <span>{t('reports.filters', 'Report Filters')}</span>
            </h2>
          </div>

          {/* Scope Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setScope('BUSINESS');
                setSelectedEmployee('');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                scope === 'BUSINESS'
                  ? 'bg-[#142B4A] dark:bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {t('reports.businessScope', 'Entire Business')}
            </button>
            <button
              onClick={() => setScope('EMPLOYEE')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                scope === 'EMPLOYEE'
                  ? 'bg-[#142B4A] dark:bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {t('reports.employeeScope', 'Specific Staff')}
            </button>
          </div>

          {/* Employee Dropdown */}
          {scope === 'EMPLOYEE' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                {t('reports.selectEmployee', 'Choose Employee')}
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">Select Employee...</option>
                {employeesData?.data?.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.employeeId || 'Staff'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Presets */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1.5">
              {t('reports.dateRange', 'Date Period')}
            </label>
            <div className="grid grid-cols-5 gap-1 text-[11px]">
              {(['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'LAST_MONTH', 'CUSTOM'] as const).map(
                (preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePeriodChange(preset)}
                    className={`py-1.5 px-1 text-center rounded-lg font-medium transition-all ${
                      periodPreset === preset
                        ? 'bg-[#2563EB] text-white shadow-sm font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {preset === 'TODAY'
                      ? 'Today'
                      : preset === 'THIS_WEEK'
                      ? 'Week'
                      : preset === 'THIS_MONTH'
                      ? 'Month'
                      : preset === 'LAST_MONTH'
                      ? 'Prev'
                      : 'Custom'}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Custom Date Pickers */}
          {periodPreset === 'CUSTOM' && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">
                  {t('reports.startDate', 'Start Date')}
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-0.5">
                  {t('reports.endDate', 'End Date')}
                </span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          )}

          {/* Report Type Selector */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">
              {t('reports.reportType', 'Report Type')}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'ALL', label: t('reports.allTransactions', 'All Txns') },
                { id: 'INCOME', label: t('reports.incomeOnly', 'Income Only') },
                { id: 'EXPENSE', label: t('reports.expenseOnly', 'Expense Only') },
              ].map((rt) => (
                <button
                  key={rt.id}
                  onClick={() => setReportType(rt.id)}
                  className={`py-1.5 text-xs rounded-xl font-medium ${
                    reportType === rt.id
                      ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {rt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 2: FINANCIAL SUMMARY PREVIEW */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('reports.financialSummary', 'Financial Summary Preview')}
          </h2>

          {isLoading ? (
            <SkeletonLoader rows={3} />
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <span className="text-[10px] text-slate-400 block">
                  {t('reports.openingBalance', 'Opening Balance')}
                </span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  ₹{openingBalance.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl">
                <span className="text-[10px] text-emerald-600 block">
                  {t('reports.totalIncome', 'Total Income')}
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  +₹{totalIncome.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-2xl">
                <span className="text-[10px] text-rose-600 block">
                  {t('reports.totalExpenses', 'Total Expenses')}
                </span>
                <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                  -₹{totalExpenses.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-2xl">
                <span className="text-[10px] text-blue-600 block">
                  {t('reports.netProfitLoss', 'Net Profit / Loss')}
                </span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  ₹{netProfit.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-2xl">
                <span className="text-[10px] text-purple-600 block">
                  {t('reports.closingBalance', 'Closing Balance')}
                </span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                  ₹{closingBalance.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <span className="text-[10px] text-slate-400 block">
                  {t('reports.transactionCount', 'Total Transactions')}
                </span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  {transactionCount}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: CHARTS */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('reports.charts', 'Visual Breakdown')}
          </h2>

          <div>
            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-2">
              Income vs Expense (Selected Period)
            </p>
            <IncomeExpenseChart data={summary?.dayWiseSummary || []} height={200} />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-2">
              {t('reports.categoryBreakdown', 'Category Distribution')}
            </p>
            <CategoryChart data={summary?.categoryBreakdown || []} height={220} />
          </div>
        </div>

        {/* SECTION 4: DOWNLOAD CENTER */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('reports.downloadCenter', 'Download Center')}
          </h2>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Generate PDF */}
            <button
              onClick={() => handleExport('pdf')}
              disabled={downloadReportMutation.isPending}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <FileText size={16} />
              <span>{t('reports.exportPdf', 'PDF Report')}</span>
            </button>

            {/* Generate Word */}
            <button
              onClick={() => handleExport('docx')}
              disabled={downloadReportMutation.isPending}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <FileText size={16} />
              <span>{t('reports.exportWord', 'Word (.docx)')}</span>
            </button>

            {/* Generate Excel */}
            <button
              onClick={() => handleExport('xlsx')}
              disabled={downloadReportMutation.isPending}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <FileSpreadsheet size={16} />
              <span>{t('reports.exportExcel', 'Excel (.xlsx)')}</span>
            </button>

            {/* Download CSV */}
            <button
              onClick={() => handleExport('csv')}
              disabled={downloadReportMutation.isPending}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Download size={16} />
              <span>{t('reports.exportCsv', 'CSV File')}</span>
            </button>
          </div>

          {/* Print & WhatsApp Sharing */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              <Printer size={15} />
              <span>{t('reports.print', 'Print Report')}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow transition-colors"
            >
              <Share2 size={15} />
              <span>{t('reports.shareWhatsApp', 'Share WhatsApp')}</span>
            </button>
          </div>
        </div>

        {/* SECTION 5: ANALYTICS PERIOD DATA TABLE */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('reports.analytics', 'Analytics Timeline')}
            </h2>
            <div className="flex gap-1 text-[10px]">
              {(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setAnalyticsTab(tab)}
                  className={`px-2 py-0.5 rounded-lg font-semibold ${
                    analyticsTab === tab
                      ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
                  <th className="py-2 pr-2">Date</th>
                  <th className="py-2 text-right">Income</th>
                  <th className="py-2 text-right">Expenses</th>
                  <th className="py-2 text-right">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {(summary?.dayWiseSummary || []).slice(0, 10).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2 pr-2 text-slate-600 dark:text-slate-300 font-mono">
                      {row.date}
                    </td>
                    <td className="py-2 text-right text-emerald-600 dark:text-emerald-400">
                      ₹{row.income.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 text-right text-rose-600 dark:text-rose-400">
                      ₹{row.expenses.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 text-right font-bold text-slate-800 dark:text-slate-200">
                      ₹{(row.income - row.expenses).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
