'use client';

import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DayStats } from '@/types';

interface DailyTrendChartProps {
  data: DayStats[];
  height?: number;
}

export function DailyTrendChart({ data, height = 240 }: DailyTrendChartProps) {
  const [mounted, setMounted] = useState(false);

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

  const chartData = (data || []).map((item) => ({
    name: item.date ? item.date.slice(5) : '',
    profit: item.profit || 0,
    income: item.income || 0,
    expenses: item.expenses || 0,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 text-xs">
          <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">{label}</p>
          <p className="text-blue-600 dark:text-blue-400 font-medium">
            Profit: ₹{payload[0]?.value?.toLocaleString('en-IN')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
          <XAxis
            dataKey="name"
            stroke="#94A3B8"
            fontSize={10}
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
          <Area
            type="monotone"
            dataKey="profit"
            stroke="#2563EB"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#profitGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DailyTrendChart;
