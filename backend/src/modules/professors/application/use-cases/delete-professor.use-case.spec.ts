import { DeleteProfessorUseCase } from './delete-professor.use-case';
import { IProfessorRepository } from '../../domain/ports/IProfessorRepository';
import { Professor } from '../../domain/entities/Professor';
import { NotFoundException } from '@nestjs/common';

describe('DeleteProfessorUseCase', () => {
  let useCase: DeleteProfessorUseCase;
  let professorRepository: jest.Mocked<IProfessorRepository>;

  const mockProfessor = new Professor('uuid-1', 'user-1', 'Ingeniería');

  beforeEach(() => {
    professorRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeleteProfessorUseCase(professorRepository);
  });

  it('should delete a professor by id', async () => {
    professorRepository.findById.mockResolvedValue(mockProfessor);

    await useCase.execute('uuid-1');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(professorRepository.delete).toHaveBeenCalledWith('uuid-1');
  });

  it('should throw NotFoundException when professor does not exist', async () => {
    professorRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('uuid-1')).rejects.toThrow(NotFoundException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(professorRepository.delete).not.toHaveBeenCalled();
  });
});
