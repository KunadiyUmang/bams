'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { isAuthenticated as checkAuth } from '@/lib/auth';
import BottomNav from '@/components/layout/BottomNav';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useDashboard } from '@/hooks/useDashboard';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  // Fetch dashboard stats to get real-time pending transaction counts for the BottomNav badge
  const { stats } = useDashboard();

  useEffect(() => {
    // Check local storage auth
    const authed = checkAuth();
    if (!authed) {
      router.replace('/login');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
        }}
      >
        <LoadingSpinner size="lg" label="Loading BAMS..." />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Scrollable page body */}
      <main
        style={{
          flex: 1,
          width: '100%',
          paddingBottom: 'calc(var(--nav-height) + var(--safe-bottom) + 20px)',
        }}
      >
        {children}
      </main>

      {/* Persistent Bottom Navigation with pending transaction badge */}
      <BottomNav pendingCount={stats?.pendingCount || 0} />
    </div>
  );
}
