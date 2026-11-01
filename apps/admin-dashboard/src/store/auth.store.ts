import { create } from 'zustand';
import { User, UserRole, LoginRequest } from '@/types';
import axios from 'axios';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  setUser: (user: User) => void;
  setError: (error: string | null) => void;
}

const TOKEN_KEY = 'bams_admin_token';
const REFRESH_KEY = 'bams_admin_refresh_token';
const USER_KEY = 'bams_admin_user';

export const isBrowser = (): boolean => typeof window !== 'undefined';

export const getStoredToken = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const getStoredRefreshToken = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem(REFRESH_KEY);
};

export const getStoredUser = (): User | null => {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setStoredAuth = (token: string, refreshToken: string, user: User) => {
  if (!isBrowser()) return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearStoredAuth = () => {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post('/api/auth/login', credentials, {
        headers: { 'Content-Type': 'application/json' },
      });

      const data = response.data?.data || response.data;
      const user = data.user as User;
      const token = data.accessToken || data.token;
      const refreshToken = data.refreshToken || token;

      if (user.role !== UserRole.SUPER_ADMIN) {
        set({
          isLoading: false,
          error: 'Access denied: Super Admin credentials required',
        });
        return false;
      }

      setStoredAuth(token, refreshToken, user);
      set({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Authentication failed. Please check credentials.';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  logout: async () => {
    try {
      const token = get().token || getStoredToken();
      if (token) {
        await axios.post(
          '/api/auth/logout',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(() => {});
      }
    } finally {
      clearStoredAuth();
      set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      if (isBrowser() && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    const token = getStoredToken();
    const user = getStoredUser();

    if (!token || !user) {
      clearStoredAuth();
      set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return false;
    }

    if (user.role !== UserRole.SUPER_ADMIN) {
      clearStoredAuth();
      set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Unauthorized role',
      });
      return false;
    }

    try {
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const freshUser = (response.data?.data || response.data) as User;
      if (freshUser && freshUser.role === UserRole.SUPER_ADMIN) {
        setStoredAuth(token, getStoredRefreshToken() || token, freshUser);
        set({
          user: freshUser,
          token,
          refreshToken: getStoredRefreshToken(),
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      } else {
        clearStoredAuth();
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return false;
      }
    } catch {
      // If server unreachable but local session valid
      set({
        user,
        token,
        refreshToken: getStoredRefreshToken(),
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    }
  },

  setUser: (user: User) => {
    if (isBrowser()) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    set({ user });
  },

  setError: (error: string | null) => set({ error }),
}));
