import type { InternalAxiosRequestConfig } from 'axios';
import axiosClient from '@/shared/api/axiosClient';

describe('axiosClient', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should have base URL /api', () => {
    expect(axiosClient.defaults.baseURL).toBe('/api');
  });

  it('should set Content-Type header', () => {
    expect(axiosClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('should attach Authorization header from localStorage', async () => {
    localStorage.setItem('token', 'test-token');
    const handler = axiosClient.interceptors.request.handlers[0]!;
    const config = await handler.fulfilled({ headers: {} } as InternalAxiosRequestConfig);
    expect(config.headers.Authorization).toBe('Bearer test-token');
  });

  it('should not attach Authorization when no token', async () => {
    const handler = axiosClient.interceptors.request.handlers[0]!;
    const config = await handler.fulfilled({ headers: {} } as InternalAxiosRequestConfig);
    expect(config.headers.Authorization).toBeUndefined();
  });

  it('should redirect to /login on 401 for non-auth requests', () => {
    const handler = axiosClient.interceptors.response.handlers[0]!;
    const error = {
      response: { status: 401 },
      config: { url: '/projects' },
    };
    localStorage.setItem('token', 'expired');
    localStorage.setItem('user', '{}');

    const originalLocation = window.location;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).location;
    window.location = { ...originalLocation, href: '' };

    expect(() => handler.rejected(error)).rejects.toBe(error);
    expect(localStorage.getItem('token')).toBeNull();
    expect(window.location.href).toBe('/login');

    window.location = originalLocation;
  });

  it('should not redirect on 401 for auth requests', async () => {
    const handler = axiosClient.interceptors.response.handlers[0]!;
    const error = {
      response: { status: 401 },
      config: { url: '/auth/login' },
    };

    await expect(handler.rejected(error)).rejects.toBe(error);
  });
});
