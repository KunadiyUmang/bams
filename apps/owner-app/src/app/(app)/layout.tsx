'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/hooks/useSocket';
import { BottomNav } from '@/components/layout/BottomNav';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { UserRole } from '@/types';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, accessToken } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  // Initialize WebSockets
  useSocket();

  useEffect(() => {
    // Check if running on client
    const token = localStorage.getItem('bams_owner_token');
    if (!token && !accessToken) {
      router.replace('/login');
      return;
    }

    if (user && user.role !== UserRole.BUSINESS_OWNER && user.role !== UserRole.SUPER_ADMIN) {
      router.replace('/login');
      return;
    }

    setIsReady(true);
  }, [isAuthenticated, user, accessToken, router]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <LoadingSpinner size={32} label="Loading BAMS..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      <main className="max-w-md w-full mx-auto pb-24 min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] shadow-xl relative border-x border-slate-200/50 dark:border-slate-800/50">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
