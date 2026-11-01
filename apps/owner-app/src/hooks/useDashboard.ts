import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => api.dashboard.getStats(),
    refetchInterval: 30000, // Background refresh every 30 seconds
    staleTime: 10000,
  });
}
