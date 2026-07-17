import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, LoginCredentials } from '@/shared/types/auth.types';
import { authService } from '@/features/auth/services/auth.service';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setTokens: (token: string, refreshToken: string) => void;
  setUser: (user: AuthUser) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (credentials) => {
        const { user, token, refreshToken } = await authService.login(credentials);
        set({ user, token, refreshToken, isAuthenticated: true });
      },

      logout: () => {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (refreshToken) {
          authService.logout(refreshToken).catch(() => {});
        }
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
      },

      setTokens: (token, refreshToken) => {
        set({ token, refreshToken });
      },

      setUser: (user) => {
        set({ user });
      },

      hydrate: () => {
        try {
          const raw = localStorage.getItem('sgp-auth');
          if (!raw) return;
          const parsed = JSON.parse(raw);
          const { user, token, refreshToken } = parsed.state ?? {};
          if (token && refreshToken && user) {
            set({ user, token, refreshToken, isAuthenticated: true });
          }
        } catch {
          // corrupted data — ignore
        }
      },
    }),
    {
      name: 'sgp-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
