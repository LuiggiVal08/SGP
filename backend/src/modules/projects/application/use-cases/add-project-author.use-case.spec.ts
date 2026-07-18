import { AddProjectAuthorUseCase } from './add-project-author.use-case';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { IStudentRepository } from '@modules/students/domain/ports/IStudentRepository';
import { ProjectAuthorModel } from '../../infrastructure/persistence/sequelize/models/project-author.model';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AddProjectAuthorUseCase', () => {
  let useCase: AddProjectAuthorUseCase;
  let projectRepository: jest.Mocked<IProjectRepository>;
  let studentRepository: jest.Mocked<IStudentRepository>;
  let authorModel: {
    findOne: jest.Mock;
    count: jest.Mock;
    create: jest.Mock;
  };

  beforeEach(() => {
    projectRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByStatus: jest.fn(),
      findBySubjectAssignment: jest.fn(),
      findByLocation: jest.fn(),
      findByCommunityTutor: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      findAllPaginated: jest.fn(),
      countFiles: jest.fn(),
      countByStatus: jest.fn(),
      countByYear: jest.fn(),
      countThisYear: jest.fn(),
      findRecentActivity: jest.fn(),
      findRecentActivityWithTimestamps: jest.fn(),
      saveFiles: jest.fn(),
      findFileById: jest.fn(),
      findFilesByProjectId: jest.fn(),
      deleteFile: jest.fn(),
      getMaxVersion: jest.fn(),
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
    studentRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByEnrollmentNumber: jest.fn(),
      findProfileById: jest.fn(),
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    authorModel = {
      findOne: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    };

    useCase = new AddProjectAuthorUseCase(
      projectRepository,
      studentRepository,
      authorModel as unknown as typeof ProjectAuthorModel,
    );
  });

  it('should add an author to a project', async () => {
    projectRepository.findById.mockResolvedValue({ id: 'proj-1' } as never);
    studentRepository.findById.mockResolvedValue({ id: 'student-1' } as never);
    authorModel.findOne.mockResolvedValue(null);
    authorModel.count.mockResolvedValue(0);
    authorModel.create.mockResolvedValue({
      id: 'author-1',
      projectId: 'proj-1',
      studentId: 'student-1',
    });

    const result = await useCase.execute({
      projectId: 'proj-1',
      studentId: 'student-1',
    });

    expect(result.studentId).toBe('student-1');
    expect(result.projectId).toBe('proj-1');
  });

  it('should reject when project not found', async () => {
    projectRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ projectId: 'bad', studentId: 's1' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should reject when student not found', async () => {
    projectRepository.findById.mockResolvedValue({ id: 'proj-1' } as never);
    studentRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ projectId: 'proj-1', studentId: 'bad' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject duplicate author', async () => {
    projectRepository.findById.mockResolvedValue({ id: 'proj-1' } as never);
    studentRepository.findById.mockResolvedValue({
      id: 'student-1',
    } as never);
    authorModel.findOne.mockResolvedValue({ id: 'existing' });

    await expect(
      useCase.execute({ projectId: 'proj-1', studentId: 'student-1' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject when max 3 authors reached', async () => {
    projectRepository.findById.mockResolvedValue({ id: 'proj-1' } as never);
    studentRepository.findById.mockResolvedValue({
      id: 'student-4',
    } as never);
    authorModel.findOne.mockResolvedValue(null);
    authorModel.count.mockResolvedValue(3);

    await expect(
      useCase.execute({ projectId: 'proj-1', studentId: 'student-4' }),
    ).rejects.toThrow(BadRequestException);
  });
});
