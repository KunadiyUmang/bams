'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { useLanguageStore } from '@/store/language.store';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30000,
          },
        },
      })
  );

  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  const checkAuth = useAuthStore((s) => s.checkAuth);
  const language = useLanguageStore((s) => s.language);

  useEffect(() => {
    setMounted(true);
    const savedTheme = (localStorage.getItem('bams_admin_theme') as Theme) || 'light';
    setThemeState(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    document.documentElement.lang = language === 'GU' ? 'gu' : 'en';

    // Verify session
    checkAuth();
  }, [checkAuth, language]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('bams_admin_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              color: theme === 'dark' ? '#F9FAFB' : '#111827',
              border: `1px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
              fontSize: '0.875rem',
              borderRadius: '0.5rem',
            },
          }}
        />
      </QueryClientProvider>
    </ThemeContext.Provider>
  );
}
