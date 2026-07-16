import { GetProjectByIdUseCase } from './get-project-by-id.use-case';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { Project } from '../../domain/entities/Project';
import { NotFoundException } from '@nestjs/common';

describe('GetProjectByIdUseCase', () => {
  let useCase: GetProjectByIdUseCase;
  let projectRepository: jest.Mocked<IProjectRepository>;

  const mockProject = new Project(
    'uuid-1',
    'Test Project',
    2024,
    'PENDING_VALIDATION' as const,
    'pnf-uuid',
    'tutor-uuid',
  );

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

    useCase = new GetProjectByIdUseCase(projectRepository);
  });

  it('should return project when found', async () => {
    projectRepository.findById.mockResolvedValue(mockProject);

    const result = await useCase.execute('uuid-1');

    expect(result).toBe(mockProject);
    expect(result.id).toBe('uuid-1');
  });

  it('should throw NotFoundException when project does not exist', async () => {
    projectRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('uuid-1')).rejects.toThrow(NotFoundException);
  });
});
