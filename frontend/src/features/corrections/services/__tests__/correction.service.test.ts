import { correctionService } from '@/features/corrections/services/correction.service';
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
  delete: ReturnType<typeof vi.fn>;
};

describe('correctionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('listByProject calls GET /projects/:id/corrections', async () => {
    mocked.get.mockResolvedValue({ data: [{ id: 'c1' }] });
    const result = await correctionService.listByProject('p1');
    expect(mocked.get).toHaveBeenCalledWith('/projects/p1/corrections', expect.anything());
    expect(result).toEqual([{ id: 'c1' }]);
  });

  it('create posts to /projects/:id/corrections', async () => {
    mocked.post.mockResolvedValue({ data: { id: 'c2' } });
    const result = await correctionService.create({ projectId: 'p1', fileId: 'f1', comment: 'fix' });
    expect(mocked.post).toHaveBeenCalledWith('/projects/p1/corrections', { fileId: 'f1', comment: 'fix' }, expect.anything());
    expect(result).toEqual({ id: 'c2' });
  });

  it('resolve patches /projects/:id/corrections/:cid/resolve', async () => {
    mocked.patch.mockResolvedValue({ data: { id: 'c2' } });
    await correctionService.resolve('p1', 'c2');
    expect(mocked.patch).toHaveBeenCalledWith('/projects/p1/corrections/c2/resolve', {}, expect.anything());
  });

  it('remove deletes /projects/:id/corrections/:cid', async () => {
    mocked.delete.mockResolvedValue({});
    await correctionService.remove('p1', 'c2');
    expect(mocked.delete).toHaveBeenCalledWith('/projects/p1/corrections/c2', expect.anything());
  });
});
