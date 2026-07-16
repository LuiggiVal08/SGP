import { GetAllProjectsUseCase } from './get-all-projects.use-case';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';

describe('GetAllProjectsUseCase', () => {
  let useCase: GetAllProjectsUseCase;
  let projectRepository: jest.Mocked<IProjectRepository>;
  let cacheService: jest.Mocked<ICacheService>;

  beforeEach(() => {
    projectRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByStatus: jest.fn(),
      findBySubjectAssignment: jest.fn(),
      findByLocation: jest.fn(),
      findByCommunityTutor: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      saveFiles: jest.fn(),
      findFileById: jest.fn(),
      findFilesByProjectId: jest.fn(),
      deleteFile: jest.fn(),
      getMaxVersion: jest.fn(),
      findAllPaginated: jest.fn(),
      countFiles: jest.fn(),
      countByStatus: jest.fn(),
      countByYear: jest.fn(),
      countThisYear: jest.fn(),
      findRecentActivity: jest.fn(),
      findMilestonesByProject: jest.fn(),
      findMilestoneById: jest.fn(),
      createMilestone: jest.fn(),
      updateMilestoneStatus: jest.fn(),
      findRevisionsByMilestone: jest.fn(),
      createRevision: jest.fn(),
      findDefensaByProject: jest.fn(),
      saveDefensa: jest.fn(),
      findCartasByProject: jest.fn(),
      createCarta: jest.fn(),
      deleteCartasByProject: jest.fn(),
    };
    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new GetAllProjectsUseCase(projectRepository, cacheService);
  });

  it('should return cached projects when available', async () => {
    const cached = [{ id: 'cached-1', title: 'Cached' }];
    cacheService.get.mockResolvedValue(JSON.stringify(cached));

    const result = await useCase.execute();

    expect(result).toEqual(cached);
    expect(projectRepository.findAll).not.toHaveBeenCalled();
  });

  it('should fetch and cache projects when cache is empty', async () => {
    const projects = [{ id: 'p1', title: 'A' }];
    cacheService.get.mockResolvedValue(null);
    projectRepository.findAll.mockResolvedValue(projects as never);

    const result = await useCase.execute();

    expect(result).toEqual(projects);
    expect(cacheService.set).toHaveBeenCalledWith(
      'projects:all',
      JSON.stringify(projects),
      3600,
    );
  });
});
