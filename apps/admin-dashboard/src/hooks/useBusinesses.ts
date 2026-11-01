import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Business,
  BusinessFilters,
  CreateBusinessRequest,
  UpdateBusinessRequest,
} from '@/types';
import toast from 'react-hot-toast';

export const BUSINESSES_QUERY_KEY = ['businesses'];

export function useBusinesses(filters: BusinessFilters = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...BUSINESSES_QUERY_KEY, filters],
    queryFn: async () => {
      const res = await api.businesses.getAll(filters);
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateBusinessRequest) => api.businesses.create(data),
    onSuccess: () => {
      toast.success('Business entity created successfully');
      queryClient.invalidateQueries({ queryKey: BUSINESSES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create business');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBusinessRequest }) =>
      api.businesses.update(id, data),
    onSuccess: () => {
      toast.success('Business updated successfully');
      queryClient.invalidateQueries({ queryKey: BUSINESSES_QUERY_KEY });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update business');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.businesses.toggleStatus(id, isActive),
    onSuccess: (_, vars) => {
      toast.success(`Business ${vars.isActive ? 'activated' : 'suspended'}`);
      queryClient.invalidateQueries({ queryKey: BUSINESSES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.businesses.delete(id),
    onSuccess: () => {
      toast.success('Business deleted');
      queryClient.invalidateQueries({ queryKey: BUSINESSES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete business');
    },
  });

  return {
    ...query,
    businesses: query.data?.data || [],
    total: query.data?.total || 0,
    totalPages: query.data?.totalPages || 1,
    createBusiness: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateBusiness: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    toggleStatus: toggleStatusMutation.mutateAsync,
    isToggling: toggleStatusMutation.isPending,
    deleteBusiness: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

export function useBusiness(id: string) {
  return useQuery({
    queryKey: [...BUSINESSES_QUERY_KEY, id],
    queryFn: async () => {
      const res = await api.businesses.getById(id);
      return res.data;
    },
    enabled: Boolean(id),
  });
}
