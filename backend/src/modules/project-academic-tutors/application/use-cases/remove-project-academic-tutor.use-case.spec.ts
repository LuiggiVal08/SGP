import { RemoveProjectAcademicTutorUseCase } from './remove-project-academic-tutor.use-case';
import { IProjectAcademicTutorRepository } from '../../domain/ports/IProjectAcademicTutorRepository';
import { IProjectRepository } from '@modules/projects/domain/ports/IProjectRepository';
import { NotFoundException } from '@nestjs/common';

describe('RemoveProjectAcademicTutorUseCase', () => {
  let useCase: RemoveProjectAcademicTutorUseCase;
  let tutorRepository: jest.Mocked<IProjectAcademicTutorRepository>;
  let projectRepository: jest.Mocked<IProjectRepository>;

  beforeEach(() => {
    tutorRepository = {
      findByProject: jest.fn(),
      findByUnique: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    projectRepository = {
      findById: jest.fn().mockResolvedValue({ id: 'p1' }),
    } as never;
    useCase = new RemoveProjectAcademicTutorUseCase(
      tutorRepository,
      projectRepository,
    );
  });

  it('should remove a tutor from a project', async () => {
    await useCase.execute('p1', 'prof1');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(tutorRepository.remove).toHaveBeenCalledWith('p1', 'prof1');
  });

  it('should throw NotFoundException when project does not exist', async () => {
    projectRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('p1', 'prof1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
