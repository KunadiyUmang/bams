import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useLanguageStore } from '@/store/language.store';

export function usePendingApprovals(params?: { page?: number; limit?: number; userId?: string }) {
  return useQuery({
    queryKey: ['pendingApprovals', params],
    queryFn: () => api.approvals.getPendingApprovals(params),
    refetchInterval: 15000, // Poll every 15s as backup to WebSockets
  });
}

export function useApprovalHistory(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['approvalHistory', params],
    queryFn: () => api.approvals.getApprovalHistory(params),
  });
}

export function useApproveTransaction() {
  const queryClient = useQueryClient();
  const t = useLanguageStore((state) => state.t);

  return useMutation({
    mutationFn: (id: string) => api.approvals.approveTransaction(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['transaction', data.id] });
      toast.success(t('transactions.approveSuccess', 'Transaction approved successfully'));
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || t('common.error', 'Failed to approve transaction');
      toast.error(msg);
    },
  });
}

export function useRejectTransaction() {
  const queryClient = useQueryClient();
  const t = useLanguageStore((state) => state.t);

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.approvals.rejectTransaction(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['transaction', data.id] });
      toast.success(t('transactions.rejectSuccess', 'Transaction rejected'));
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || t('common.error', 'Failed to reject transaction');
      toast.error(msg);
    },
  });
}

export function useBulkApprove() {
  const queryClient = useQueryClient();
  const t = useLanguageStore((state) => state.t);

  return useMutation({
    mutationFn: (ids: string[]) => api.approvals.bulkApprove(ids),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success(
        `${res.count || 'Selected'} ${t('transactions.bulkApproveSuccess', 'transactions approved successfully')}`
      );
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || t('common.error', 'Failed to bulk approve');
      toast.error(msg);
    },
  });
}
