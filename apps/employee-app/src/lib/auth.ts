import { User, UserRole } from '@/types';

const ACCESS_TOKEN_KEY = 'bams_employee_token';
const REFRESH_TOKEN_KEY = 'bams_employee_refresh_token';
const USER_KEY = 'bams_employee_user';

export const isBrowser = (): boolean => typeof window !== 'undefined';

export const getToken = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (!isBrowser()) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const clearToken = (): void => {
  if (!isBrowser()) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token: string): void => {
  if (!isBrowser()) return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const clearRefreshToken = (): void => {
  if (!isBrowser()) return;
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const getUser = (): User | null => {
  if (!isBrowser()) return null;
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
};

export const setUser = (user: User): void => {
  if (!isBrowser()) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearUser = (): void => {
  if (!isBrowser()) return;
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const getUserRole = (): UserRole | null => {
  const user = getUser();
  return user ? user.role : null;
};

export const clearAuth = (): void => {
  clearToken();
  clearRefreshToken();
  clearUser();
};
