import { DeleteProjectUseCase } from './delete-project.use-case';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';
import { NotFoundException } from '@nestjs/common';

describe('DeleteProjectUseCase', () => {
  let useCase: DeleteProjectUseCase;
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

    useCase = new DeleteProjectUseCase(projectRepository, cacheService);
  });

  it('should delete project', async () => {
    projectRepository.findById.mockResolvedValue({ id: 'uuid-1' } as never);

    await useCase.execute('uuid-1');

    expect(projectRepository.delete).toHaveBeenCalledWith('uuid-1');
    expect(cacheService.delete).toHaveBeenCalledWith('projects:all');
  });

  it('should throw NotFoundException when project does not exist', async () => {
    projectRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('uuid-1')).rejects.toThrow(NotFoundException);
    expect(projectRepository.delete).not.toHaveBeenCalled();
  });
});
