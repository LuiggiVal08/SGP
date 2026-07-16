import { useAuthStore } from '@/shared/store/auth.store';
import type { AuthUser } from '@/shared/types/auth.types';

const mockUser: AuthUser = {
  id: '1',
  dni: '',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  role: 'ADMIN',
  isActive: true,
  pnfId: '',
  institutionId: '',
};

const { mockLoginResponse } = vi.hoisted(() => ({
  mockLoginResponse: {
    user: { id: '1', dni: '', firstName: 'Test', lastName: 'User', email: 'test@example.com', role: 'ADMIN', isActive: true, pnfId: '', institutionId: '' },
    token: 'fake-jwt-token',
    refreshToken: 'fake-refresh-token',
  },
}));

vi.mock('@/features/auth/services/auth.service', () => ({
  authService: {
    login: vi.fn().mockResolvedValue(mockLoginResponse),
    logout: vi.fn().mockResolvedValue(undefined),
  },
}));

function persistedKey() {
  const raw = localStorage.getItem('sgp-auth');
  if (!raw) return null;
  return JSON.parse(raw);
}

describe('auth.store', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, refreshToken: null, isAuthenticated: false });
    localStorage.clear();
  });

  it('should start unauthenticated', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.refreshToken).toBeNull();
  });

  it('should login and persist to localStorage', async () => {
    await useAuthStore.getState().login({ email: 'test@example.com', password: '123456' });
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('fake-jwt-token');
    expect(state.refreshToken).toBe('fake-refresh-token');
    const persisted = persistedKey();
    expect(persisted.state.token).toBe('fake-jwt-token');
    expect(persisted.state.refreshToken).toBe('fake-refresh-token');
    expect(persisted.state.user).toEqual(mockUser);
  });

  it('should logout and clear state', async () => {
    await useAuthStore.getState().login({ email: 'test@example.com', password: '123456' });
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.refreshToken).toBeNull();
  });

  it('should hydrate from localStorage', () => {
    localStorage.setItem('sgp-auth', JSON.stringify({
      state: { user: mockUser, token: 'stored-token', refreshToken: 'stored-refresh' },
      version: 0,
    }));
    useAuthStore.getState().hydrate();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('stored-token');
    expect(state.refreshToken).toBe('stored-refresh');
  });

  it('should handle corrupted localStorage data', () => {
    localStorage.setItem('sgp-auth', 'not-valid-json');
    useAuthStore.getState().hydrate();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should setTokens without changing user', () => {
    useAuthStore.setState({ user: mockUser, token: 'old-token', refreshToken: 'old-refresh', isAuthenticated: true });
    useAuthStore.getState().setTokens('new-token', 'new-refresh');
    const state = useAuthStore.getState();
    expect(state.token).toBe('new-token');
    expect(state.refreshToken).toBe('new-refresh');
    expect(state.user).toEqual(mockUser);
  });
});
