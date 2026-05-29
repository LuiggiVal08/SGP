import { useAuthStore } from '@/shared/store/auth.store';
import type { AuthUser } from '@/shared/types/auth.types';

const mockUser: AuthUser = {
  id: '1',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  role: 'ADMIN',
};

const { mockLoginResponse } = vi.hoisted(() => ({
  mockLoginResponse: {
    user: { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com', role: 'ADMIN' },
    token: 'fake-jwt-token',
  },
}));

vi.mock('@/features/auth/services/auth.service', () => ({
  authService: {
    login: vi.fn().mockResolvedValue(mockLoginResponse),
  },
}));

describe('auth.store', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
    localStorage.clear();
  });

  it('should start unauthenticated', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('should login and persist to localStorage', async () => {
    await useAuthStore.getState().login({ email: 'test@example.com', password: '123456' });
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('fake-jwt-token');
    expect(localStorage.getItem('token')).toBe('fake-jwt-token');
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
  });

  it('should logout and clear state', async () => {
    await useAuthStore.getState().login({ email: 'test@example.com', password: '123456' });
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('should hydrate from localStorage', () => {
    localStorage.setItem('token', 'stored-token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    useAuthStore.getState().hydrate();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('stored-token');
  });

  it('should handle corrupted localStorage data', () => {
    localStorage.setItem('token', 'stored-token');
    localStorage.setItem('user', 'not-valid-json');
    useAuthStore.getState().hydrate();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });
});
