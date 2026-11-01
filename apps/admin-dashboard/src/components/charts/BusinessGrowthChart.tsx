'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export interface BusinessGrowthPoint {
  month: string;
  businesses: number;
  newCount?: number;
}

interface BusinessGrowthChartProps {
  data?: BusinessGrowthPoint[];
  height?: number;
  className?: string;
}

const defaultData: BusinessGrowthPoint[] = [
  { month: 'Jun', businesses: 6, newCount: 2 },
  { month: 'Jul', businesses: 8, newCount: 2 },
  { month: 'Aug', businesses: 9, newCount: 1 },
  { month: 'Sep', businesses: 11, newCount: 2 },
  { month: 'Oct', businesses: 12, newCount: 1 },
  { month: 'Nov', businesses: 14, newCount: 2 },
];

export const BusinessGrowthChart: React.FC<BusinessGrowthChartProps> = ({
  data = defaultData,
  height = 280,
  className = '',
}) => {
  return (
    <div className={`w-full bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Business Growth Trend
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Active registered businesses (Last 6 Months)
          </p>
        </div>
      </div>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="bizGrowthColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
            <XAxis
              dataKey="month"
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
              formatter={(val: number) => [`${val} Businesses`, 'Total Active']}
            />
            <Area
              type="monotone"
              dataKey="businesses"
              stroke="#2563EB"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#bizGrowthColor)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BusinessGrowthChart;
