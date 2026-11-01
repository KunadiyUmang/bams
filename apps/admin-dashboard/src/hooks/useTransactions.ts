import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Transaction, TransactionFilters } from '@/types';
import toast from 'react-hot-toast';

export const TRANSACTIONS_QUERY_KEY = ['transactions'];

export function useTransactions(filters: TransactionFilters = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEY, filters],
    queryFn: async () => {
      const res = await api.transactions.getAll(filters);
      return res.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.transactions.approve(id),
    onSuccess: () => {
      toast.success('Transaction approved');
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to approve transaction');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.transactions.reject(id, reason),
    onSuccess: () => {
      toast.success('Transaction rejected');
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to reject transaction');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.transactions.delete(id),
    onSuccess: () => {
      toast.success('Transaction deleted');
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete transaction');
    },
  });

  const exportTransactions = async (format: 'csv' | 'xlsx') => {
    try {
      toast.loading('Preparing export...', { id: 'export-tx' });
      const blob = await api.transactions.export(filters, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Download complete', { id: 'export-tx' });
    } catch {
      toast.error('Export failed', { id: 'export-tx' });
    }
  };

  return {
    ...query,
    transactions: query.data?.data || [],
    total: query.data?.total || 0,
    totalPages: query.data?.totalPages || 1,
    approveTransaction: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    rejectTransaction: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,
    deleteTransaction: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    exportTransactions,
  };
}
