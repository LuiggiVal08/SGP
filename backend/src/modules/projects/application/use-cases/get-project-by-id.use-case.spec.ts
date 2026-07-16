import { GetProjectByIdUseCase } from './get-project-by-id.use-case';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { NotFoundException } from '@nestjs/common';

describe('GetProjectByIdUseCase', () => {
  let useCase: GetProjectByIdUseCase;
  let projectRepository: jest.Mocked<IProjectRepository>;

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

    useCase = new GetProjectByIdUseCase(projectRepository);
  });

  it('should return project when found', async () => {
    const mock = { id: 'uuid-1', title: 'Test' };
    projectRepository.findById.mockResolvedValue(mock as never);

    const result = await useCase.execute('uuid-1');

    expect(result).toBe(mock);
  });

  it('should throw NotFoundException when project does not exist', async () => {
    projectRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('uuid-1')).rejects.toThrow(NotFoundException);
  });
});
