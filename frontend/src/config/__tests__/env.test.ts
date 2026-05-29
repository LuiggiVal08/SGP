import { API_BASE_URL } from '@/config/env';

describe('env', () => {
  it('should have API_BASE_URL as /api', () => {
    expect(API_BASE_URL).toBe('/api');
  });
});
