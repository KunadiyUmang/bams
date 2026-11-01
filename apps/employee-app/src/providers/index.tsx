'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { useLanguageStore } from '@/store/language.store';
import { useSocket } from '@/hooks/useSocket';
import { ThemeMode } from '@/types';

// Theme Context
interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('light');

  useEffect(() => {
    const saved = localStorage.getItem('bams_employee_theme') as ThemeMode;
    const initial = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setThemeState(initial);
    if (initial === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('bams_employee_theme', newTheme);
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
      {children}
    </ThemeContext.Provider>
  );
};

// Auth Provider to hydrate user session
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initializeAuth } = useAuthStore();
  const { language } = useLanguageStore();

  useEffect(() => {
    initializeAuth();
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [initializeAuth, language]);

  return <>{children}</>;
};

// Socket Provider
interface SocketContextType {
  isConnected: boolean;
  emit: (event: string, data?: unknown) => void;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  emit: () => {},
});

export const useAppSocket = () => useContext(SocketContext);

const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketData = useSocket();

  return (
    <SocketContext.Provider value={socketData}>
      {children}
    </SocketContext.Provider>
  );
};

// Main Providers wrapper
export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3500,
                style: {
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-lg)',
                  fontSize: '0.9rem',
                  maxWidth: '380px',
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
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default Providers;
