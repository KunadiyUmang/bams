'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export interface DailyVolumePoint {
  date: string;
  count: number;
  income?: number;
  expenses?: number;
  amount?: number;
}

interface TransactionVolumeChartProps {
  data?: DailyVolumePoint[];
  height?: number;
  className?: string;
}

const generateDefaultData = (): DailyVolumePoint[] => {
  return Array.from({ length: 30 }, (_, i) => ({
    date: `${i + 1}`,
    count: Math.floor(Math.random() * 25) + 10,
    amount: (Math.floor(Math.random() * 40) + 15) * 10000,
  }));
};

const formatCurrency = (val: number) => {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
  return `₹${val}`;
};

export const TransactionVolumeChart: React.FC<TransactionVolumeChartProps> = ({
  data = generateDefaultData(),
  height = 280,
  className = '',
}) => {
  return (
    <div className={`w-full bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Transaction Activity (30 Days)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Daily system-wide transaction counts
          </p>
        </div>
      </div>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
            <XAxis
              dataKey="date"
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.92)',
                borderRadius: '8px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(val: number) => [`${val} Transactions`, 'Volume']}
              labelFormatter={(lbl) => `Day ${lbl}`}
            />
            <Bar
              dataKey="count"
              fill="#142B4A"
              radius={[3, 3, 0, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TransactionVolumeChart;
