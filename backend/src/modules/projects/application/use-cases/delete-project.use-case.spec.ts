import { DeleteProjectUseCase } from './delete-project.use-case';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';
import { Project } from '../../domain/entities/Project';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('DeleteProjectUseCase', () => {
  let useCase: DeleteProjectUseCase;
  let projectRepository: jest.Mocked<IProjectRepository>;
  let cacheService: jest.Mocked<ICacheService>;

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
    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new DeleteProjectUseCase(projectRepository, cacheService);
  });

  it('should delete project when no files are attached', async () => {
    projectRepository.findById.mockResolvedValue(mockProject);
    projectRepository.countFiles.mockResolvedValue(0);

    await useCase.execute('uuid-1');

    expect(projectRepository.delete).toHaveBeenCalledWith('uuid-1');
    expect(cacheService.delete).toHaveBeenCalledWith('projects:all');
  });

  it('should throw NotFoundException when project does not exist', async () => {
    projectRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('uuid-1')).rejects.toThrow(NotFoundException);
    expect(projectRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when project has attached files', async () => {
    projectRepository.findById.mockResolvedValue(mockProject);
    projectRepository.countFiles.mockResolvedValue(3);

    await expect(useCase.execute('uuid-1')).rejects.toThrow(ConflictException);
    expect(projectRepository.delete).not.toHaveBeenCalled();
  });
});
