import { defenseService } from '@/features/defenses/services/defense.service';
import axiosClient from '@/shared/api/axiosClient';

vi.mock('@/shared/api/axiosClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mocked = axiosClient as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
};

describe('defenseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('list calls GET /defenses', async () => {
    mocked.get.mockResolvedValue({ data: [{ id: 'd1' }] });
    const result = await defenseService.list();
    expect(mocked.get).toHaveBeenCalledWith('/defenses', expect.anything());
    expect(result).toEqual([{ id: 'd1' }]);
  });

  it('getByProject calls GET /defenses/project/:id', async () => {
    mocked.get.mockResolvedValue({ data: [] });
    await defenseService.getByProject('p1');
    expect(mocked.get).toHaveBeenCalledWith('/defenses/project/p1', expect.anything());
  });

  it('schedule posts to /defenses', async () => {
    mocked.post.mockResolvedValue({ data: { id: 'd2' } });
    const payload = {
      projectId: 'p1',
      scheduledDate: '2026-08-01T10:00:00.000Z',
      judges: [{ judgeType: 'SUBJECT_PROFESSOR' as const, professorId: 'pr1', communityTutorId: 'ct1' }],
    };
    const result = await defenseService.schedule(payload);
    expect(mocked.post).toHaveBeenCalledWith('/defenses', payload, expect.anything());
    expect(result).toEqual({ id: 'd2' });
  });

  it('reschedule patches /defenses/:id', async () => {
    mocked.patch.mockResolvedValue({ data: { id: 'd2' } });
    await defenseService.reschedule('d2', { scheduledDate: '2026-09-01T10:00:00.000Z' });
    expect(mocked.patch).toHaveBeenCalledWith('/defenses/d2', { scheduledDate: '2026-09-01T10:00:00.000Z' }, expect.anything());
  });

  it('realize patches /defenses/:id/realize', async () => {
    mocked.patch.mockResolvedValue({ data: { id: 'd2' } });
    await defenseService.realize('d2');
    expect(mocked.patch).toHaveBeenCalledWith('/defenses/d2/realize', {}, expect.anything());
  });

  it('cancel patches /defenses/:id/cancel', async () => {
    mocked.patch.mockResolvedValue({ data: { id: 'd2' } });
    await defenseService.cancel('d2');
    expect(mocked.patch).toHaveBeenCalledWith('/defenses/d2/cancel', {}, expect.anything());
  });
});
