'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useLanguageStore } from '@/store/language.store';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30, // 30 seconds
            gcTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: true,
            retry: 1,
          },
        },
      })
  );

  const { theme, language } = useLanguageStore();

  useEffect(() => {
    // Sync theme class
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Sync language attribute
    document.documentElement.lang = language;
    document.documentElement.classList.remove('lang-en', 'lang-gu');
    document.documentElement.classList.add(`lang-${language}`);
  }, [theme, language]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: theme === 'dark' ? '#1E293B' : '#FFFFFF',
            color: theme === 'dark' ? '#F8FAFC' : '#142B4A',
            border: theme === 'dark' ? '1px solid #334155' : '1px solid #E2E8F0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 500,
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#16A34A',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#DC2626',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}
