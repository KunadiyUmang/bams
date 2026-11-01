'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { DayStats } from '@/types';
import { useLanguageStore } from '@/store/language.store';

interface IncomeExpenseChartProps {
  data: DayStats[] | Array<{ date?: string; month?: string; income: number; expenses: number }>;
  height?: number;
}

export function IncomeExpenseChart({ data, height = 240 }: IncomeExpenseChartProps) {
  const [mounted, setMounted] = useState(false);
  const t = useLanguageStore((state) => state.t);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{ height }}
        className="w-full bg-slate-100 dark:bg-slate-800/40 rounded-2xl animate-pulse"
      />
    );
  }

  const formattedData = (data || []).map((item: any) => ({
    name: item.date ? item.date.slice(5) : item.month || '',
    Income: Number(item.income) || 0,
    Expenses: Number(item.expenses) || 0,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 text-xs">
          <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">{label}</p>
          <p className="text-emerald-600 dark:text-emerald-400 font-medium">
            {t('dashboard.todayIncome', 'Income')}: ₹{payload[0]?.value?.toLocaleString('en-IN')}
          </p>
          <p className="text-rose-600 dark:text-rose-400 font-medium">
            {t('dashboard.todayExpenses', 'Expenses')}: ₹{payload[1]?.value?.toLocaleString('en-IN')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
          <XAxis
            dataKey="name"
            stroke="#94A3B8"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#E2E8F0' }}
          />
          <YAxis
            stroke="#94A3B8"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
          />
          <Bar
            name={t('dashboard.todayIncome', 'Income')}
            dataKey="Income"
            fill="#2563EB"
            radius={[4, 4, 0, 0]}
            maxBarSize={22}
          />
          <Bar
            name={t('dashboard.todayExpenses', 'Expenses')}
            dataKey="Expenses"
            fill="#EF4444"
            radius={[4, 4, 0, 0]}
            maxBarSize={22}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default IncomeExpenseChart;
