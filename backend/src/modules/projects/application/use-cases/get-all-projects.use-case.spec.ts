import { GetAllProjectsUseCase } from './get-all-projects.use-case';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';
import { Project } from '../../domain/entities/Project';

describe('GetAllProjectsUseCase', () => {
  let useCase: GetAllProjectsUseCase;
  let projectRepository: jest.Mocked<IProjectRepository>;
  let cacheService: jest.Mocked<ICacheService>;

  const mockProjects = [
    new Project('uuid-1', 'Project A', 2024, 'COMPLETED', 'pnf-1', 'tutor-1'),
    new Project(
      'uuid-2',
      'Project B',
      2025,
      'PENDING_VALIDATION',
      'pnf-1',
      'tutor-2',
    ),
  ];

  const mockPaginated = {
    data: [mockProjects[0]],
    meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
  };

  beforeEach(() => {
    projectRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      findByStatus: jest.fn(),
      findByPnf: jest.fn(),
      findByTutor: jest.fn(),
      save: jest.fn(),
      saveFiles: jest.fn(),
      update: jest.fn(),
      findFilesByProjectId: jest.fn(),
      deleteFile: jest.fn(),
      delete: jest.fn(),
      countByPnfId: jest.fn(),
      countFiles: jest.fn(),
      countByStatus: jest.fn(),
      countByYear: jest.fn(),
      countThisYear: jest.fn(),
      countByTutor: jest.fn(),
      findRecentActivity: jest.fn(),
      findByDocente: jest.fn(),
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

  it('should return all projects from cache when no pagination', async () => {
    cacheService.get.mockResolvedValue(JSON.stringify(mockProjects));

    const result = await useCase.execute();

    expect(result).toEqual(mockProjects);
    expect(projectRepository.findAll).not.toHaveBeenCalled();
  });

  it('should fetch and cache projects when cache is empty', async () => {
    cacheService.get.mockResolvedValue(null);
    projectRepository.findAll.mockResolvedValue(mockProjects);

    const result = await useCase.execute();

    expect(result).toEqual(mockProjects);
    expect(cacheService.set).toHaveBeenCalledWith(
      'projects:all',
      JSON.stringify(mockProjects),
      3600,
    );
  });

  it('should return paginated results when pagination params are provided', async () => {
    projectRepository.findAllPaginated.mockResolvedValue(mockPaginated);

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result).toEqual(mockPaginated);
    expect(projectRepository.findAllPaginated).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
    });
    expect(cacheService.get).not.toHaveBeenCalled();
  });

  it('should return paginated results with search', async () => {
    projectRepository.findAllPaginated.mockResolvedValue(mockPaginated);

    const result = await useCase.execute({
      page: 1,
      limit: 10,
      search: 'Project',
    });

    expect(result).toEqual(mockPaginated);
    expect(projectRepository.findAllPaginated).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      search: 'Project',
    });
  });

  it('should return all projects when empty dto is passed', async () => {
    cacheService.get.mockResolvedValue(null);
    projectRepository.findAll.mockResolvedValue(mockProjects);

    const result = await useCase.execute({});

    expect(result).toEqual(mockProjects);
    expect(projectRepository.findAll).toHaveBeenCalled();
  });
});
