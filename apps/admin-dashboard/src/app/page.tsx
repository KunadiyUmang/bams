'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] dark:bg-[#0A0F1E]">
      <LoadingSpinner size="lg" label="Initializing BAMS Super Admin..." />
    </div>
  );
}
