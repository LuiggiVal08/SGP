import { ListProjectAuthorsUseCase } from './list-project-authors.use-case';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { ProjectAuthorModel } from '../../infrastructure/persistence/sequelize/models/project-author.model';
import { NotFoundException } from '@nestjs/common';

describe('ListProjectAuthorsUseCase', () => {
  let useCase: ListProjectAuthorsUseCase;
  let projectRepository: jest.Mocked<IProjectRepository>;
  let authorModel: { findAll: jest.Mock };

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
    authorModel = { findAll: jest.fn() };

    useCase = new ListProjectAuthorsUseCase(
      projectRepository,
      authorModel as unknown as typeof ProjectAuthorModel,
    );
  });

  it('should list authors for a project', async () => {
    projectRepository.findById.mockResolvedValue({
      id: 'proj-1',
    } as never);
    authorModel.findAll.mockResolvedValue([
      {
        id: 'a1',
        projectId: 'proj-1',
        studentId: 's1',
        authorOrder: 1,
        student: {
          id: 's1',
          enrollmentNumber: 'E001',
          user: { firstName: 'John', lastName: 'Doe', email: 'j@test.com' },
        },
      },
    ]);

    const result = await useCase.execute('proj-1');

    expect(result).toHaveLength(1);
    expect(result[0].studentId).toBe('s1');
  });

  it('should throw NotFoundException when project not found', async () => {
    projectRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('bad')).rejects.toThrow(NotFoundException);
  });
});
