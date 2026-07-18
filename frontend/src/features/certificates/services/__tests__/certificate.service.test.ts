import { certificateService } from '../certificate.service';
import axiosClient from '@/shared/api/axiosClient';

vi.mock('@/shared/api/axiosClient', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedGet = vi.mocked(axiosClient.get);

describe('certificateService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('lists completion certificates', async () => {
    const payload = {
      data: { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 } },
    };
    mockedGet.mockResolvedValue(payload as never);

    const res = await certificateService.list({ page: 1, limit: 10 });

    expect(mockedGet).toHaveBeenCalledWith('/completion-certificates', {
      params: { page: 1, limit: 10 },
      signal: undefined,
    });
    expect(res).toEqual(payload.data);
  });

  it('fetches a certificate by id', async () => {
    const cert = {
      id: 'c1',
      authorId: 'a1',
      pdfUrl: '/x.pdf',
      serialNumber: 'S-1',
      issuedAt: '2024-01-01T00:00:00.000Z',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    mockedGet.mockResolvedValue({ data: cert } as never);

    const res = await certificateService.getById('c1');

    expect(mockedGet).toHaveBeenCalledWith('/completion-certificates/c1', {
      signal: undefined,
    });
    expect(res.id).toBe('c1');
  });
});
