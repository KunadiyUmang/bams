import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

export function useSocket() {
  const queryClient = useQueryClient();
  const { user, accessToken, isAuthenticated } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

    const socket = io(socketUrl, {
      auth: {
        token: accessToken,
      },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      if (user.businessId) {
        socket.emit('join:business', { businessId: user.businessId });
      }
    });

    socket.on('transaction.created', (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });

      const amount = data?.transaction?.amount || '';
      const creator = data?.transaction?.user?.name || 'An employee';
      toast(
        `🔔 New Transaction: ₹${amount} submitted by ${creator}`,
        {
          icon: '⚡',
          duration: 5000,
        }
      );
    });

    socket.on('transaction.approved', () => {
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    });

    socket.on('transaction.rejected', () => {
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    });

    socket.on('notification.new', (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      const message = data?.notification?.messageEn || 'You have a new update';
      toast(message, { icon: '📢' });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, accessToken, user, queryClient]);

  return socketRef.current;
}
