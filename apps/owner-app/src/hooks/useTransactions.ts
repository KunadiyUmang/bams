import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { CreateTransactionRequest, TransactionFilters, UpdateTransactionRequest } from '@/types';
import toast from 'react-hot-toast';
import { useLanguageStore } from '@/store/language.store';

export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => api.transactions.getTransactions(filters),
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => api.transactions.getTransaction(id),
    enabled: !!id,
  });
}

export function useCategories(type?: string) {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: () => api.categories.getCategories({ type }),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const t = useLanguageStore((state) => state.t);

  return useMutation({
    mutationFn: (data: CreateTransactionRequest) => api.transactions.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      toast.success(t('transactions.createSuccess', 'Transaction recorded successfully'));
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || t('common.error', 'Failed to create transaction');
      toast.error(msg);
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const t = useLanguageStore((state) => state.t);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionRequest }) =>
      api.transactions.updateTransaction(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction', data.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success(t('common.success', 'Transaction updated successfully'));
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || t('common.error', 'Failed to update transaction');
      toast.error(msg);
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const t = useLanguageStore((state) => state.t);

  return useMutation({
    mutationFn: (id: string) => api.transactions.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success(t('common.success', 'Transaction deleted'));
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || t('common.error', 'Failed to delete transaction');
      toast.error(msg);
    },
  });
}
