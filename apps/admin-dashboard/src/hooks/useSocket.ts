'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getStoredToken } from '@/store/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      // connected to backend real-time stream
    });

    socket.on('transaction.created', (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast('New transaction recorded in system', {
        icon: '💳',
      });
    });

    socket.on('transaction.approved', (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    });

    socket.on('audit.new', (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    });

    socket.on('notification.new', (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(data?.notification?.titleEn || 'New system notification received');
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  return socketRef.current;
}

export default useSocket;
