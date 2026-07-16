import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/shared/store/auth.store';
import { authService } from '@/features/auth/services/auth.service';
import { sileo } from 'sileo';
import { jwtDecode } from 'jwt-decode';

const REFRESH_INTERVAL = 12 * 60 * 1000;
const WARNING_BEFORE_MS = 2 * 60 * 1000;
const AUTO_LOGOUT_DELAY_MS = 60 * 1000;

interface JwtPayload {
  exp: number;
}

function getExpMs(token: string): number | null {
  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    return exp * 1000;
  } catch {
    return null;
  }
}

export function SessionTimer() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnedRef = useRef(false);
  const refreshRef = useRef<(() => Promise<void>) | undefined>(undefined);

  const clearLogoutTimer = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  const logout = useCallback(() => {
    clearLogoutTimer();
    useAuthStore.getState().logout();
    sileo.info({ title: 'Sesión cerrada', description: 'Su sesión ha expirado por inactividad.' });
  }, [clearLogoutTimer]);

  const refresh = useCallback(async () => {
    const store = useAuthStore.getState();
    if (!store.refreshToken) return;

    try {
      const data = await authService.refresh(store.refreshToken);
      store.setTokens(data.accessToken, data.refreshToken);
      warnedRef.current = false;
      clearLogoutTimer();
    } catch {
      logout();
    }
  }, [clearLogoutTimer, logout]);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkExpiry = () => {
      const store = useAuthStore.getState();
      if (!store.token) return;
      const expMs = getExpMs(store.token);
      if (expMs && expMs - Date.now() < WARNING_BEFORE_MS && !warnedRef.current) {
        warnedRef.current = true;
        logoutTimerRef.current = setTimeout(logout, AUTO_LOGOUT_DELAY_MS);
        sileo.action({
          title: 'Su sesión está por expirar',
          description: 'Presione "Renovar sesión" para mantener su acceso activo.',
          duration: null,
          button: {
            title: 'Renovar sesión',
            onClick: () => {
              refreshRef.current?.();
            },
          },
        });
      }
    };

    checkExpiry();
    intervalRef.current = setInterval(() => {
      checkExpiry();
      refreshRef.current?.();
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearLogoutTimer();
    };
  }, [isAuthenticated, clearLogoutTimer, logout]);

  return null;
}
