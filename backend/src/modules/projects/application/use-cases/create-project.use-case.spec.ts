import { CreateProjectUseCase } from './create-project.use-case';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { ICareerRepository } from '../../../careers/domain/ports/ICareerRepository';
import { IUserRepository } from '../../../users/domain/ports/IUserRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';
import { Career } from '../../../careers/domain/entities/Career';
import { User } from '../../../users/domain/entities/User';
import { BadRequestException } from '@nestjs/common';

describe('CreateProjectUseCase', () => {
  let useCase: CreateProjectUseCase;
  let projectRepository: jest.Mocked<IProjectRepository>;
  let careerRepository: jest.Mocked<ICareerRepository>;
  let userRepository: jest.Mocked<IUserRepository>;
  let cacheService: jest.Mocked<ICacheService>;

  const mockCareer = new Career('career-uuid', 'Engineering');
  const mockTutor = new User(
    'tutor-uuid',
    '11111111',
    'Prof',
    'Smith',
    'smith@test.com',
    'hash',
    true,
    'career-uuid',
    'inst-uuid',
    'role-uuid',
  );
  const mockAuthor = new User(
    'author-1',
    '22222222',
    'Student',
    'A',
    'a@test.com',
    'hash',
    true,
    'career-uuid',
    'inst-uuid',
    'role-uuid',
  );

  beforeEach(() => {
    projectRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findByStatus: jest.fn(),
      findByCareer: jest.fn(),
      findByTutor: jest.fn(),
      save: jest.fn(),
      saveFiles: jest.fn(),
      delete: jest.fn(),
    };
    careerRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
    };
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByDni: jest.fn(),
      findAll: jest.fn(),
      findByRoleId: jest.fn(),
      save: jest.fn(),
    };
    cacheService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new CreateProjectUseCase(
      projectRepository,
      careerRepository,
      userRepository,
      cacheService,
    );
  });

  it('should create project with valid data', async () => {
    careerRepository.findById.mockResolvedValue(mockCareer);
    userRepository.findById.mockImplementation((id: string) => {
      if (id === 'tutor-uuid') return Promise.resolve(mockTutor);
      if (id === 'author-1') return Promise.resolve(mockAuthor);
      return Promise.resolve(null);
    });
    projectRepository.save.mockResolvedValue({} as never);

    await useCase.execute({
      title: 'My Project',
      year: 2025,
      careerId: 'career-uuid',
      authorIds: ['author-1'],
      tutorId: 'tutor-uuid',
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(projectRepository.save).toHaveBeenCalled();
  });

  it('should reject more than 3 authors', async () => {
    await expect(
      useCase.execute({
        title: 'Overload',
        year: 2025,
        careerId: 'career-uuid',
        authorIds: ['a', 'b', 'c', 'd'],
        tutorId: 'tutor-uuid',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject when career not found', async () => {
    careerRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        title: 'No Career',
        year: 2025,
        careerId: 'nonexistent',
        authorIds: ['author-1'],
        tutorId: 'tutor-uuid',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject when tutor not found', async () => {
    careerRepository.findById.mockResolvedValue(mockCareer);
    userRepository.findById.mockImplementation((id: string) => {
      if (id === 'author-1') return Promise.resolve(mockAuthor);
      return Promise.resolve(null);
    });

    await expect(
      useCase.execute({
        title: 'No Tutor',
        year: 2025,
        careerId: 'career-uuid',
        authorIds: ['author-1'],
        tutorId: 'nonexistent',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
