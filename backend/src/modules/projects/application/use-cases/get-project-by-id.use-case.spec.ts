import { GetProjectByIdUseCase } from './get-project-by-id.use-case';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { NotFoundException } from '@nestjs/common';

describe('GetProjectByIdUseCase', () => {
  let useCase: GetProjectByIdUseCase;
  let projectRepository: jest.Mocked<IProjectRepository>;

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

    useCase = new GetProjectByIdUseCase(projectRepository);
  });

  it('should return project when found', async () => {
    const mock = { id: 'uuid-1', title: 'Test' };
    projectRepository.findById.mockResolvedValue(mock as never);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await useCase.execute('uuid-1');

    expect(result).toBe(mock);
  });

  it('should throw NotFoundException when project does not exist', async () => {
    projectRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('uuid-1')).rejects.toThrow(NotFoundException);
  });
});
