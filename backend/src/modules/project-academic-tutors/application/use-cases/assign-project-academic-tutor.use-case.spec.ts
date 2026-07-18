import { AssignProjectAcademicTutorUseCase } from './assign-project-academic-tutor.use-case';
import { IProjectAcademicTutorRepository } from '../../domain/ports/IProjectAcademicTutorRepository';
import { IProjectRepository } from '@modules/projects/domain/ports/IProjectRepository';
import { IProjectSubjectAssignmentRepository } from '@modules/project-subject-assignments/domain/ports/IProjectSubjectAssignmentRepository';
import { IProfessorRepository } from '@modules/professors/domain/ports/IProfessorRepository';
import { ProjectAcademicTutor } from '../../domain/entities/ProjectAcademicTutor';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('AssignProjectAcademicTutorUseCase', () => {
  let useCase: AssignProjectAcademicTutorUseCase;
  let tutorRepository: jest.Mocked<IProjectAcademicTutorRepository>;
  let projectRepository: jest.Mocked<IProjectRepository>;
  let assignmentRepository: jest.Mocked<IProjectSubjectAssignmentRepository>;
  let professorRepository: jest.Mocked<IProfessorRepository>;

  const project = { id: 'p1', subjectAssignmentId: 'sa1' } as never;

  beforeEach(() => {
    tutorRepository = {
      findByProject: jest.fn(),
      findByUnique: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    projectRepository = {
      findById: jest.fn().mockResolvedValue(project),
    } as never;
    assignmentRepository = {
      findById: jest.fn(),
      findAllPaginated: jest.fn(),
      findByUnique: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    professorRepository = {
      findById: jest.fn().mockResolvedValue({ id: 'prof1' }),
      findByUserId: jest.fn(),
      findProfileById: jest.fn(),
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new AssignProjectAcademicTutorUseCase(
      tutorRepository,
      projectRepository,
      assignmentRepository,
      professorRepository,
    );
  });

  it('should assign a professor as academic tutor', async () => {
    tutorRepository.findByUnique.mockResolvedValue(null);
    assignmentRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute({
      projectId: 'p1',
      professorId: 'prof1',
    });

    expect(result).toBeInstanceOf(ProjectAcademicTutor);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(tutorRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException when project does not exist', async () => {
    projectRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ projectId: 'p1', professorId: 'prof1' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should throw BadRequestException when professor does not exist', async () => {
    professorRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ projectId: 'p1', professorId: 'prof1' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should throw BadRequestException when tutor already assigned', async () => {
    tutorRepository.findByUnique.mockResolvedValue(
      new ProjectAcademicTutor('id', 'p1', 'prof1', new Date(), true),
    );

    await expect(
      useCase.execute({ projectId: 'p1', professorId: 'prof1' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should throw BadRequestException when professor is the subject assignment teacher', async () => {
    tutorRepository.findByUnique.mockResolvedValue(null);
    assignmentRepository.findById.mockResolvedValue({
      id: 'sa1',
      professorId: 'prof1',
    } as never);

    await expect(
      useCase.execute({ projectId: 'p1', professorId: 'prof1' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
