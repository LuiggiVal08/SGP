import { CreateProjectUseCase } from './create-project.use-case';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';
import { IProjectSubjectAssignmentRepository } from '@modules/project-subject-assignments/domain/ports/IProjectSubjectAssignmentRepository';
import { ICommunityTutorRepository } from '@modules/community-tutors/domain/ports/ICommunityTutorRepository';
import { BadRequestException } from '@nestjs/common';

describe('CreateProjectUseCase', () => {
  let useCase: CreateProjectUseCase;
  let projectRepository: jest.Mocked<IProjectRepository>;
  let cacheService: jest.Mocked<ICacheService>;
  let assignmentRepository: jest.Mocked<IProjectSubjectAssignmentRepository>;
  let communityTutorRepository: jest.Mocked<ICommunityTutorRepository>;

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
    assignmentRepository = {
      findById: jest.fn(),
      findAllPaginated: jest.fn(),
      findByUnique: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    communityTutorRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new CreateProjectUseCase(
      projectRepository,
      cacheService,
      assignmentRepository,
      communityTutorRepository,
    );
  });

  it('should create project with valid data', async () => {
    assignmentRepository.findById.mockResolvedValue({
      id: 'sa-uuid',
      subjectId: 's1',
      professorId: 'p1',
      periodId: 'per1',
    });
    communityTutorRepository.findById.mockResolvedValue({
      id: 'ct-uuid',
    } as never);
    projectRepository.save.mockResolvedValue({} as never);

    await useCase.execute({
      title: 'My Project',
      subjectAssignmentId: 'sa-uuid',
      locationId: 'loc-uuid',
      communityTutorId: 'ct-uuid',
      studentIds: ['student-1'],
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(projectRepository.save).toHaveBeenCalled();
  });

  it('should reject more than 3 authors', async () => {
    await expect(
      useCase.execute({
        title: 'Overload',
        subjectAssignmentId: 'sa-uuid',
        locationId: 'loc-uuid',
        communityTutorId: 'ct-uuid',
        studentIds: ['a', 'b', 'c', 'd'],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject when subject assignment does not exist', async () => {
    assignmentRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        title: 'No Assignment',
        subjectAssignmentId: 'bad-sa',
        locationId: 'loc-uuid',
        communityTutorId: 'ct-uuid',
        studentIds: ['student-1'],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject when community tutor does not exist', async () => {
    assignmentRepository.findById.mockResolvedValue({
      id: 'sa-uuid',
    } as never);
    communityTutorRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        title: 'No Tutor',
        subjectAssignmentId: 'sa-uuid',
        locationId: 'loc-uuid',
        communityTutorId: 'bad-ct',
        studentIds: ['student-1'],
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
