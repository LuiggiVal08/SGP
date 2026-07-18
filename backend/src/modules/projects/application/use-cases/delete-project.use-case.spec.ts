import { DeleteProjectUseCase } from './delete-project.use-case';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('DeleteProjectUseCase', () => {
  let useCase: DeleteProjectUseCase;
  let projectRepository: jest.Mocked<IProjectRepository>;
  let cacheService: jest.Mocked<ICacheService>;

  beforeEach(() => {
    projectRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByIds: jest.fn(),
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
      findRecentActivityWithTimestamps: jest.fn(),
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

  it('should delete project', async () => {
    projectRepository.findById.mockResolvedValue({ id: 'uuid-1' } as never);
    projectRepository.countFiles.mockResolvedValue(0);

    await useCase.execute('uuid-1');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(projectRepository.delete).toHaveBeenCalledWith('uuid-1');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(cacheService.delete).toHaveBeenCalledWith('projects:all');
  });

  it('should throw NotFoundException when project does not exist', async () => {
    projectRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('uuid-1')).rejects.toThrow(NotFoundException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(projectRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when project has files', async () => {
    projectRepository.findById.mockResolvedValue({ id: 'uuid-1' } as never);
    projectRepository.countFiles.mockResolvedValue(3);

    await expect(useCase.execute('uuid-1')).rejects.toThrow(ConflictException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(projectRepository.delete).not.toHaveBeenCalled();
  });
});
