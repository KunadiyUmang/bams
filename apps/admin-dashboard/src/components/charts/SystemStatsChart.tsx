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
  Legend,
} from 'recharts';

export interface BusinessIncomeExpenseData {
  name: string;
  income: number;
  expenses: number;
  net?: number;
}

interface SystemStatsChartProps {
  data?: BusinessIncomeExpenseData[];
  height?: number;
  className?: string;
}

const defaultData: BusinessIncomeExpenseData[] = [
  { name: 'Patel Trading', income: 1450000, expenses: 890000 },
  { name: 'Krishna Tex', income: 2890000, expenses: 1780000 },
  { name: 'Om Logistics', income: 620000, expenses: 490000 },
  { name: 'Shreeji Pharma', income: 1980000, expenses: 1120000 },
  { name: 'Diamond World', income: 3450000, expenses: 2300000 },
];

const formatCurrency = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
  return `₹${val}`;
};

export const SystemStatsChart: React.FC<SystemStatsChartProps> = ({
  data = defaultData,
  height = 320,
  className = '',
}) => {
  return (
    <div className={`w-full bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Income vs Expense by Business
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Top operating entities compared
          </p>
        </div>
      </div>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
            <XAxis
              dataKey="name"
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), '']}
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.92)',
                borderRadius: '8px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
              }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              iconType="circle"
            />
            <Bar
              dataKey="income"
              name="Income"
              fill="#16A34A"
              radius={[4, 4, 0, 0]}
              animationDuration={900}
            />
            <Bar
              dataKey="expenses"
              name="Expenses"
              fill="#DC2626"
              radius={[4, 4, 0, 0]}
              animationDuration={900}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SystemStatsChart;
