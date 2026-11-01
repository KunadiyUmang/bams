'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useSocket } from '@/hooks/useSocket';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Initialize background socket connection for real-time alerts
  useSocket();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user || user.role !== 'SUPER_ADMIN') {
        router.replace('/login');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] dark:bg-[#0A0F1E]">
        <LoadingSpinner size="lg" label="Validating administrator authorization..." />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] dark:bg-[#0A0F1E]">
        <LoadingSpinner size="md" label="Redirecting to secure login..." />
      </div>
    );
  }

  return <MainLayout>{children}</MainLayout>;
}
