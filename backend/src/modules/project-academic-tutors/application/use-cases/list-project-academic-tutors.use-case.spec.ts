import { ListProjectAcademicTutorsUseCase } from './list-project-academic-tutors.use-case';
import { IProjectAcademicTutorRepository } from '../../domain/ports/IProjectAcademicTutorRepository';
import { IProjectRepository } from '@modules/projects/domain/ports/IProjectRepository';
import { ProjectAcademicTutor } from '../../domain/entities/ProjectAcademicTutor';
import { NotFoundException } from '@nestjs/common';

describe('ListProjectAcademicTutorsUseCase', () => {
  let useCase: ListProjectAcademicTutorsUseCase;
  let tutorRepository: jest.Mocked<IProjectAcademicTutorRepository>;
  let projectRepository: jest.Mocked<IProjectRepository>;

  const tutors = [
    new ProjectAcademicTutor('id', 'p1', 'prof1', new Date(), true),
  ];

  beforeEach(() => {
    tutorRepository = {
      findByProject: jest.fn().mockResolvedValue(tutors),
      findByUnique: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    projectRepository = {
      findById: jest.fn().mockResolvedValue({ id: 'p1' }),
    } as never;
    useCase = new ListProjectAcademicTutorsUseCase(
      tutorRepository,
      projectRepository,
    );
  });

  it('should return tutors for the project', async () => {
    const result = await useCase.execute('p1');

    expect(result).toEqual(tutors);
  });

  it('should throw NotFoundException when project does not exist', async () => {
    projectRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('p1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
