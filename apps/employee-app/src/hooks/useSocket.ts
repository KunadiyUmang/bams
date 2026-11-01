'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { getToken } from '@/lib/auth';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const token = getToken();

    if (!isAuthenticated || !user || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Join user-specific room
      socket.emit('join:user', { userId: user.id, businessId: user.businessId });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Handle transaction updates (approvals, rejections, status changes)
    socket.on('transaction:approved', (data: { id: string; description?: string }) => {
      toast.success(`Transaction approved: ${data.description || 'Success'}`);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    socket.on('transaction:rejected', (data: { id: string; description?: string; reason?: string }) => {
      toast.error(`Transaction rejected: ${data.reason || 'Check details'}`);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    socket.on('transaction:created', () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    socket.on('transaction:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    });

    // Handle notifications
    socket.on('notification:new', (notification: { title: string; message: string }) => {
      toast(notification.title || 'New Notification', {
        icon: '🔔',
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    // Handle daily report updates
    socket.on('daily_report:reviewed', () => {
      toast.success('Your daily report has been reviewed!');
      queryClient.invalidateQueries({ queryKey: ['daily-reports'] });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, user?.id, user?.businessId, queryClient]);

  const emit = (event: string, data?: unknown) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    emit,
  };
};

export default useSocket;
