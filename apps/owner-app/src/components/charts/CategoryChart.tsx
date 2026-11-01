'use client';

import React, { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface CategoryData {
  category: string;
  amount: number;
  percentage?: number;
}

interface CategoryChartProps {
  data: CategoryData[];
  height?: number;
}

const COLORS = [
  '#2563EB', // Blue
  '#16A34A', // Green
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#64748B', // Slate
];

export function CategoryChart({ data, height = 240 }: CategoryChartProps) {
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

  const chartData = (data || []).filter((item) => Number(item.amount) > 0);

  if (chartData.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center text-xs text-slate-400"
      >
        No category data available
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 text-xs">
          <p className="font-bold text-slate-800 dark:text-slate-200">
            {item.name}
          </p>
          <p className="text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
            ₹{Number(item.value).toLocaleString('en-IN')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={3}
            dataKey="amount"
            nameKey="category"
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CategoryChart;
