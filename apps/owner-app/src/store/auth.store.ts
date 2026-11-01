import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('bams_owner_token', accessToken);
          localStorage.setItem('bams_owner_refresh', refreshToken);
        }
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      updateUser: (updatedFields) => {
        const currentUser = get().user;
        if (!currentUser) return;
        set({
          user: { ...currentUser, ...updatedFields },
        });
      },

      setTokens: (accessToken, refreshToken) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('bams_owner_token', accessToken);
          if (refreshToken) {
            localStorage.setItem('bams_owner_refresh', refreshToken);
          }
        }
        set((state) => ({
          accessToken,
          refreshToken: refreshToken || state.refreshToken,
          isAuthenticated: true,
        }));
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bams_owner_token');
          localStorage.removeItem('bams_owner_refresh');
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'bams-owner-auth-storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
