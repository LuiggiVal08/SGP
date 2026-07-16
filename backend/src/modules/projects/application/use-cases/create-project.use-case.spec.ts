import { CreateProjectUseCase } from './create-project.use-case';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';
import { BadRequestException } from '@nestjs/common';

describe('CreateProjectUseCase', () => {
  let useCase: CreateProjectUseCase;
  let projectRepository: jest.Mocked<IProjectRepository>;
  let cacheService: jest.Mocked<ICacheService>;

  beforeEach(() => {
    projectRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByStatus: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      saveFiles: jest.fn(),
      findFileById: jest.fn(),
      delete: jest.fn(),
    };
    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new CreateProjectUseCase(projectRepository, cacheService);
  });

  it('should create project with valid data', async () => {
    projectRepository.save.mockResolvedValue({} as never);

    await useCase.execute({
      title: 'My Project',
      subjectAssignmentId: 'sa-uuid',
      locationId: 'loc-uuid',
      communityTutorId: 'ct-uuid',
      authorIds: ['author-1'],
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
        authorIds: ['a', 'b', 'c', 'd'],
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
