import { notificationService } from '../notification.service';
import axiosClient from '@/shared/api/axiosClient';

vi.mock('@/shared/api/axiosClient', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockedGet = vi.mocked(axiosClient.get);
const mockedPatch = vi.mocked(axiosClient.patch);

describe('notificationService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('lists notifications with status filter', async () => {
    const payload = { data: { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 } } };
    mockedGet.mockResolvedValue(payload as never);

    const res = await notificationService.list({ status: 'UNREAD', limit: 10 });

    expect(mockedGet).toHaveBeenCalledWith(
      '/notifications/users/me/notifications',
      { params: { status: 'UNREAD', limit: 10 }, signal: undefined },
    );
    expect(res).toEqual(payload.data);
  });

  it('marks a notification as read', async () => {
    mockedPatch.mockResolvedValue({ data: { success: true } } as never);

    const res = await notificationService.markAsRead('n1');

    expect(mockedPatch).toHaveBeenCalledWith(
      '/notifications/users/me/notifications/n1/read',
      {},
      { signal: undefined },
    );
    expect(res.success).toBe(true);
  });

  it('marks all notifications as read', async () => {
    mockedPatch.mockResolvedValue({ data: { success: true } } as never);

    const res = await notificationService.markAllAsRead();

    expect(mockedPatch).toHaveBeenCalledWith(
      '/notifications/users/me/notifications/read-all',
      {},
      { signal: undefined },
    );
    expect(res.success).toBe(true);
  });
});
