'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DashboardStats } from '@/types';

export const useDashboard = () => {
  const queryClient = useQueryClient();

  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery<DashboardStats, Error>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      try {
        const response = await api.transactions.getDashboard();
        return response.data;
      } catch (err) {
        // Fallback for development if backend stats endpoint returns slightly different shape
        const statsRes = await api.transactions.getStats('today').catch(() => null);
        if (statsRes && statsRes.data) {
          return statsRes.data;
        }
        throw err;
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });

  const refreshDashboard = async () => {
    await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    await queryClient.invalidateQueries({ queryKey: ['transactions'] });
  };

  return {
    stats: dashboardData,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    refreshDashboard,
  };
};

export default useDashboard;
