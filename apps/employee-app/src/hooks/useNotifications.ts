'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Notification } from '@/types';
import toast from 'react-hot-toast';

export const useNotifications = () => {
  return useQuery<Notification[], Error>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.notifications.getNotifications();
      return response.data;
    },
    refetchInterval: 30000, // Poll every 30 seconds as fallback to socket
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.notifications.markAsRead(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.notifications.markAllRead();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: (err: any) => {
      toast.error('Failed to mark notifications as read');
    },
  });
};
