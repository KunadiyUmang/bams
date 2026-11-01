import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { CreateEmployeeRequest, UpdateEmployeeRequest, User } from '@/types';
import toast from 'react-hot-toast';
import { useLanguageStore } from '@/store/language.store';

export function useEmployees(params?: { search?: string; isActive?: boolean; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => api.employees.getEmployees(params),
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: () => api.employees.getEmployee(id),
    enabled: !!id,
  });
}

export function useEmployeeStats(id: string, period?: string) {
  return useQuery({
    queryKey: ['employeeStats', id, period],
    queryFn: () => api.employees.getEmployeeStats(id, period),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  const t = useLanguageStore((state) => state.t);

  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) => api.employees.createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success(t('employees.createSuccess', 'Employee added successfully'));
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || t('common.error', 'Failed to create employee');
      toast.error(msg);
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  const t = useLanguageStore((state) => state.t);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeRequest }) =>
      api.employees.updateEmployee(id, data),
    onSuccess: (updatedEmployee) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', updatedEmployee.id] });
      toast.success(t('employees.updateSuccess', 'Employee updated successfully'));
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || t('common.error', 'Failed to update employee');
      toast.error(msg);
    },
  });
}

export function useToggleEmployeeActive() {
  const queryClient = useQueryClient();
  const t = useLanguageStore((state) => state.t);

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.employees.toggleEmployeeActive(id, isActive),
    onSuccess: (updatedEmployee) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', updatedEmployee.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success(
        updatedEmployee.isActive
          ? t('employees.statusChanged', 'Employee activated')
          : t('employees.statusChanged', 'Employee deactivated')
      );
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || t('common.error', 'Failed to update employee status');
      toast.error(msg);
    },
  });
}
