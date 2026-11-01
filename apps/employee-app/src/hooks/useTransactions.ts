'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Transaction,
  TransactionFilters,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionType,
  Category,
  PaginatedResponse,
} from '@/types';
import toast from 'react-hot-toast';

export const useTransactions = (filters: TransactionFilters = {}) => {
  return useQuery<PaginatedResponse<Transaction>, Error>({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const response = await api.transactions.getTransactions(filters);
      return response.data;
    },
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useTransaction = (id: string) => {
  return useQuery<Transaction, Error>({
    queryKey: ['transactions', id],
    queryFn: async () => {
      const response = await api.transactions.getTransaction(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCategories = (type?: TransactionType) => {
  return useQuery<Category[], Error>({
    queryKey: ['categories', type],
    queryFn: async () => {
      const response = await api.categories.getCategories(type);
      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTransactionInput) => {
      const response = await api.transactions.createTransaction(data);
      return response.data;
    },
    onSuccess: (newTx) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(
        `${newTx.type === 'INCOME' ? 'Income' : 'Expense'} recorded successfully!`
      );
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to save transaction';
      toast.error(message);
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTransactionInput }) => {
      const response = await api.transactions.updateTransaction(id, data);
      return response.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', updated.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Transaction updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update transaction';
      toast.error(message);
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.transactions.deleteTransaction(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Transaction deleted');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete transaction';
      toast.error(message);
    },
  });
};
