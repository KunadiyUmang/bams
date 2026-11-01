import { create } from 'zustand';
import { User } from '@/types';
import { api } from '@/lib/api';
import {
  getToken,
  setToken,
  setRefreshToken,
  getUser,
  setUser,
  clearAuth,
  isAuthenticated as checkIsAuthenticated,
} from '@/lib/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getUser(),
  isAuthenticated: checkIsAuthenticated(),
  isLoading: false,

  initializeAuth: () => {
    const token = getToken();
    const storedUser = getUser();
    if (token && storedUser) {
      set({ user: storedUser, isAuthenticated: true });
      // Fetch fresh user profile in background
      get().refreshUser().catch(() => {
        // If profile fetch fails with auth error, store will be cleared by interceptor
      });
    } else {
      set({ user: null, isAuthenticated: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await api.auth.login({ email, password });
      const { user, token, refreshToken } = response.data;

      setToken(token);
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }
      setUser(user);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.auth.logout();
    } catch (error) {
      console.warn('Logout request failed, clearing local state anyway', error);
    } finally {
      clearAuth();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  refreshUser: async () => {
    try {
      const response = await api.auth.getMe();
      const updatedUser = response.data;
      setUser(updatedUser);
      set({ user: updatedUser, isAuthenticated: true });
    } catch (error) {
      console.error('Failed to refresh user', error);
      throw error;
    }
  },

  updateUser: async (data: Partial<User>) => {
    set({ isLoading: true });
    try {
      const response = await api.auth.updateMe(data);
      const updatedUser = response.data;
      setUser(updatedUser);
      set({ user: updatedUser, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
