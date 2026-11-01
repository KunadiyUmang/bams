'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('bams_owner_token') : null;
    if (token || isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <LoadingSpinner size={32} label="Redirecting..." />
    </div>
  );
}
