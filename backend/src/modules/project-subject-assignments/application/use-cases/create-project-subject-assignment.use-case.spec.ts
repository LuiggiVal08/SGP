import { CreateProjectSubjectAssignmentUseCase } from './create-project-subject-assignment.use-case';
import { IProjectSubjectAssignmentRepository } from '../../domain/ports/IProjectSubjectAssignmentRepository';
import { ISubjectRepository } from '@modules/subjects/domain/ports/ISubjectRepository';
import { IProfessorRepository } from '@modules/professors/domain/ports/IProfessorRepository';
import { IPeriodRepository } from '@modules/periods/domain/ports/IPeriodRepository';
import { ProjectSubjectAssignment } from '../../domain/entities/ProjectSubjectAssignment';
import { BadRequestException } from '@nestjs/common';

describe('CreateProjectSubjectAssignmentUseCase', () => {
  let useCase: CreateProjectSubjectAssignmentUseCase;
  let assignmentRepository: jest.Mocked<IProjectSubjectAssignmentRepository>;
  let subjectRepository: jest.Mocked<ISubjectRepository>;
  let professorRepository: jest.Mocked<IProfessorRepository>;
  let periodRepository: jest.Mocked<IPeriodRepository>;

  const input = {
    subjectId: 'subject-1',
    professorId: 'professor-1',
    periodId: 'period-1',
  };

  beforeEach(() => {
    assignmentRepository = {
      findById: jest.fn(),
      findAllPaginated: jest.fn(),
      findByUnique: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    subjectRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    professorRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      save: jest.fn(),
    };
    periodRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new CreateProjectSubjectAssignmentUseCase(
      assignmentRepository,
      subjectRepository,
      professorRepository,
      periodRepository,
    );
  });

  it('should create an assignment when all referenced entities exist', async () => {
    subjectRepository.findById.mockResolvedValue({
      id: 'subject-1',
      trajectoryId: 't-1',
      name: 'Calc',
    });
    professorRepository.findById.mockResolvedValue({
      id: 'professor-1',
      userId: 'u-1',
    });
    periodRepository.findById.mockResolvedValue({
      id: 'period-1',
    } as never);
    assignmentRepository.findByUnique.mockResolvedValue(null);
    assignmentRepository.save.mockResolvedValue(undefined);

    const result = await useCase.execute(input);

    expect(assignmentRepository.save).toHaveBeenCalledTimes(1);
    expect(result).toBeInstanceOf(ProjectSubjectAssignment);
    expect(result.subjectId).toBe('subject-1');
  });

  it('should throw BadRequestException when subject does not exist', async () => {
    subjectRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toThrow(BadRequestException);
    expect(assignmentRepository.save).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when the unique triple already exists', async () => {
    subjectRepository.findById.mockResolvedValue({
      id: 'subject-1',
      trajectoryId: 't-1',
      name: 'Calc',
    });
    professorRepository.findById.mockResolvedValue({
      id: 'professor-1',
      userId: 'u-1',
    });
    periodRepository.findById.mockResolvedValue({
      id: 'period-1',
    } as never);
    assignmentRepository.findByUnique.mockResolvedValue(
      new ProjectSubjectAssignment(
        'a-1',
        'subject-1',
        'professor-1',
        'period-1',
      ),
    );

    await expect(useCase.execute(input)).rejects.toThrow(BadRequestException);
    expect(assignmentRepository.save).not.toHaveBeenCalled();
  });
});
