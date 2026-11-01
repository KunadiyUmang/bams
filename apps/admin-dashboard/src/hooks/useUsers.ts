import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { User, UserFilters, CreateUserRequest, UpdateUserRequest } from '@/types';
import toast from 'react-hot-toast';

export const USERS_QUERY_KEY = ['users'];

export function useUsers(filters: UserFilters = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...USERS_QUERY_KEY, filters],
    queryFn: async () => {
      const res = await api.users.getAll(filters);
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => api.users.create(data),
    onSuccess: () => {
      toast.success('User account created successfully');
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create user');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      api.users.update(id, data),
    onSuccess: () => {
      toast.success('User details updated successfully');
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update user');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.users.toggleStatus(id, isActive),
    onSuccess: (_, vars) => {
      toast.success(`User ${vars.isActive ? 'activated' : 'deactivated'}`);
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to change user status');
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password?: string }) =>
      api.users.resetPassword(id, password),
    onSuccess: () => {
      toast.success('Password reset successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.users.delete(id),
    onSuccess: () => {
      toast.success('User deleted');
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    },
  });

  return {
    ...query,
    users: query.data?.data || [],
    total: query.data?.total || 0,
    totalPages: query.data?.totalPages || 1,
    createUser: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateUser: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    toggleStatus: toggleStatusMutation.mutateAsync,
    isToggling: toggleStatusMutation.isPending,
    resetPassword: resetPasswordMutation.mutateAsync,
    isResettingPassword: resetPasswordMutation.isPending,
    deleteUser: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
