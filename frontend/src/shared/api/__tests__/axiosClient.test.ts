import type { InternalAxiosRequestConfig } from 'axios';
import axiosClient from '@/shared/api/axiosClient';
import { useAuthStore } from '@/shared/store/auth.store';

function getRequestInterceptor() {
  const handlers = axiosClient.interceptors.request['handlers'];
  expect(handlers).toBeDefined();
  return handlers![0] as { fulfilled: (config: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig>; rejected: (error: unknown) => Promise<never> };
}

function getResponseInterceptor() {
  const handlers = axiosClient.interceptors.response['handlers'];
  expect(handlers).toBeDefined();
  return handlers![0] as { fulfilled?: (response: unknown) => unknown; rejected: (error: unknown) => Promise<never> };
}

describe('axiosClient', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, refreshToken: null, isAuthenticated: false });
    localStorage.clear();
  });

  it('should have base URL /api', () => {
    expect(axiosClient.defaults.baseURL).toBe('/api');
  });

  it('should set Content-Type header', () => {
    expect(axiosClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('should attach Authorization header from store', async () => {
    useAuthStore.setState({ token: 'test-token' });
    const handler = getRequestInterceptor();
    const config = await handler.fulfilled({ headers: {} } as InternalAxiosRequestConfig);
    expect(config.headers.Authorization).toBe('Bearer test-token');
  });

  it('should not attach Authorization when no token', async () => {
    const handler = getRequestInterceptor();
    const config = await handler.fulfilled({ headers: {} } as InternalAxiosRequestConfig);
    expect(config.headers.Authorization).toBeUndefined();
  });

  it('should redirect to /login on 401 when no refreshToken', async () => {
    const handler = getResponseInterceptor();
    const error = {
      response: { status: 401 },
      config: { url: '/projects' },
    };
    useAuthStore.setState({ token: 'expired', isAuthenticated: true });

    const originalLocation = window.location;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).location;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.location = { href: '' } as any;

    await expect(handler.rejected!(error)).rejects.toBe(error);
    expect(useAuthStore.getState().token).toBeNull();
    expect(window.location.href).toBe('/login');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.location = originalLocation as any;
  });

  it('should not redirect on 401 for auth requests', async () => {
    const handler = getResponseInterceptor();
    const error = {
      response: { status: 401 },
      config: { url: '/auth/login' },
    };

    await expect(handler.rejected!(error)).rejects.toBe(error);
  });
});
