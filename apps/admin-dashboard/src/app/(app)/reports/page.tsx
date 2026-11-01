'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  Calendar,
  Building2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useLanguageStore } from '@/store/language.store';
import { ReportType, ReportFormat } from '@/types';
import { Button } from '@/components/ui/Button';
import { StatsCard } from '@/components/ui/StatsCard';
import { Badge } from '@/components/ui/Badge';
import { SystemStatsChart } from '@/components/charts/SystemStatsChart';
import { format, subDays, startOfMonth, startOfYear } from 'date-fns';

export default function ReportsPage() {
  const { t } = useLanguageStore();
  const { businesses } = useBusinesses();

  const [reportType, setReportType] = useState<ReportType>(ReportType.SYSTEM_SUMMARY);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [dateFrom, setDateFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [formatOption, setFormatOption] = useState<ReportFormat>(ReportFormat.PDF);

  const { summary, isLoading, downloadReport } = useReports({
    type: reportType,
    businessId: selectedBusinessId || undefined,
    dateFrom,
    dateTo,
  });

  const handleApplyPreset = (preset: 'today' | 'week' | 'month' | 'year') => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    if (preset === 'today') {
      setDateFrom(todayStr);
      setDateTo(todayStr);
    } else if (preset === 'week') {
      setDateFrom(format(subDays(today, 7), 'yyyy-MM-dd'));
      setDateTo(todayStr);
    } else if (preset === 'month') {
      setDateFrom(format(startOfMonth(today), 'yyyy-MM-dd'));
      setDateTo(todayStr);
    } else if (preset === 'year') {
      setDateFrom(format(startOfYear(today), 'yyyy-MM-dd'));
      setDateTo(todayStr);
    }
  };

  const formatCurrency = (val?: number) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('reports.title', 'Financial Reports & Statements')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate consolidated auditor statements, comparative analytics, and multi-format exports
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            Print
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() => downloadReport(formatOption)}
            className="bg-[#142B4A] hover:bg-[#0F2137] text-white"
          >
            Export {formatOption.toUpperCase()}
          </Button>
        </div>
      </div>

      {/* Control Panel: Configuration & Filters */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Report Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Report Category
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value={ReportType.SYSTEM_SUMMARY}>Consolidated System Summary</option>
              <option value={ReportType.BUSINESS_COMPARISON}>Comparative Entity Analysis</option>
              <option value={ReportType.EMPLOYEE_PERFORMANCE}>Staff Ledger Rankings</option>
              <option value={ReportType.CATEGORY_BREAKDOWN}>Expense & Income Categorization</option>
            </select>
          </div>

          {/* Business Entity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Business Scope
            </label>
            <select
              value={selectedBusinessId}
              onChange={(e) => setSelectedBusinessId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="">All Registered Businesses</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              From Date
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              To Date
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            />
          </div>
        </div>

        {/* Quick Presets & Format Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">Quick Presets:</span>
            <button
              onClick={() => handleApplyPreset('today')}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded"
            >
              Today
            </button>
            <button
              onClick={() => handleApplyPreset('week')}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handleApplyPreset('month')}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded"
            >
              This Month
            </button>
            <button
              onClick={() => handleApplyPreset('year')}
              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded"
            >
              This Year
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Export Format:</span>
            {[
              { id: ReportFormat.PDF, label: 'PDF Document' },
              { id: ReportFormat.EXCEL, label: 'Excel (XLSX)' },
              { id: ReportFormat.CSV, label: 'CSV' },
              { id: ReportFormat.WORD, label: 'Word (DOCX)' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFormatOption(f.id)}
                className={`px-2.5 py-1 rounded font-semibold transition ${
                  formatOption === f.id
                    ? 'bg-[#142B4A] dark:bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Statement Preview Container */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 space-y-8">
        {/* Statement Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#142B4A] text-white flex items-center justify-center font-bold text-sm">
                B
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Business Account Management System (BAMS)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Super Admin Executive Statement & Consolidated Ledger
            </p>
          </div>

          <div className="text-right text-xs text-slate-500">
            <p className="font-semibold text-slate-900 dark:text-white">
              Statement Period: {dateFrom} to {dateTo}
            </p>
            <p>Generated: {format(new Date(), 'PPpp')}</p>
            <p className="text-[11px] text-slate-400">Classified: Internal Financial Governance</p>
          </div>
        </div>

        {/* Statement Financial Metrics */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">
                Opening Balance
              </span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {formatCurrency(summary.openingBalance)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                Gross Income
              </span>
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                +{formatCurrency(summary.totalIncome)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase">
                Gross Expenses
              </span>
              <p className="text-xl font-bold text-rose-700 dark:text-rose-300 mt-1">
                -{formatCurrency(summary.totalExpenses)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase">
                Net Operating Balance
              </span>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                {formatCurrency(summary.netProfit)}
              </p>
            </div>
          </div>
        )}

        {/* Visual Chart Comparison */}
        {summary?.businessBreakdown && summary.businessBreakdown.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Entity Comparative Breakdown
            </h3>
            <SystemStatsChart
              data={summary.businessBreakdown.map((b) => ({
                name: b.businessName,
                income: b.income,
                expenses: b.expenses,
              }))}
              height={260}
            />
          </div>
        )}

        {/* Breakdown Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Business Performance Ledger
          </h3>
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-2.5 px-4">Business Name</th>
                  <th className="py-2.5 px-4 text-center">Transactions</th>
                  <th className="py-2.5 px-4 text-right">Income (₹)</th>
                  <th className="py-2.5 px-4 text-right">Expenses (₹)</th>
                  <th className="py-2.5 px-4 text-right">Net Profit / (Loss)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {summary?.businessBreakdown?.map((b) => (
                  <tr key={b.businessId} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {b.businessName}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">
                      {b.transactionCount}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(b.income)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-rose-600 dark:text-rose-400">
                      {formatCurrency(b.expenses)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(b.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Staff Volume Rankings */}
        {summary?.employeeRankings && summary.employeeRankings.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Employee Transaction Contributions
            </h3>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="py-2.5 px-4">Staff Member</th>
                    <th className="py-2.5 px-4">Operating Business</th>
                    <th className="py-2.5 px-4 text-center">Entries Handled</th>
                    <th className="py-2.5 px-4 text-right">Total Cumulative Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {summary.employeeRankings.map((emp) => (
                    <tr key={emp.userId} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                        {emp.userName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {emp.businessName}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">
                        {emp.transactionCount}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(emp.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sign-off footer */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-8 text-xs text-slate-400">
          <div>
            <p className="font-semibold text-slate-700 dark:text-slate-300">System Verification</p>
            <p className="mt-1">Generated and signed by BAMS Super Admin Console.</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-slate-700 dark:text-slate-300">Auditor Acknowledgement</p>
            <div className="mt-8 border-b border-dashed border-slate-300 w-48 ml-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
