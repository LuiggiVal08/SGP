import { RemoveProjectAuthorUseCase } from './remove-project-author.use-case';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { ProjectAuthorModel } from '../../infrastructure/persistence/sequelize/models/project-author.model';
import { NotFoundException } from '@nestjs/common';

describe('RemoveProjectAuthorUseCase', () => {
  let useCase: RemoveProjectAuthorUseCase;
  let projectRepository: jest.Mocked<IProjectRepository>;
  let authorModel: { destroy: jest.Mock };

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
    authorModel = { destroy: jest.fn() };

    useCase = new RemoveProjectAuthorUseCase(
      projectRepository,
      authorModel as unknown as typeof ProjectAuthorModel,
    );
  });

  it('should remove an author from a project', async () => {
    projectRepository.findById.mockResolvedValue({
      id: 'proj-1',
    } as never);
    authorModel.destroy.mockResolvedValue(1);

    await useCase.execute('proj-1', 'student-1');

    expect(authorModel.destroy).toHaveBeenCalledWith({
      where: { projectId: 'proj-1', studentId: 'student-1' },
    });
  });

  it('should throw NotFoundException when project not found', async () => {
    projectRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('bad', 's1')).rejects.toThrow(
      NotFoundException,
    );
  });
});
