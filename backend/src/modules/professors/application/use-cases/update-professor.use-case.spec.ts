import { UpdateProfessorUseCase } from './update-professor.use-case';
import { IProfessorRepository } from '../../domain/ports/IProfessorRepository';
import { Professor } from '../../domain/entities/Professor';
import { NotFoundException } from '@nestjs/common';

describe('UpdateProfessorUseCase', () => {
  let useCase: UpdateProfessorUseCase;
  let professorRepository: jest.Mocked<IProfessorRepository>;

  beforeEach(() => {
    professorRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findProfileById: jest.fn(),
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new UpdateProfessorUseCase(professorRepository);
  });

  it('should update a professor profile specialization', async () => {
    const existing = new Professor('uuid-1', 'user-1', 'Sistemas');
    professorRepository.findById.mockResolvedValue(existing);
    professorRepository.save.mockResolvedValue(undefined);

    const result = await useCase.execute('uuid-1', {
      specialization: 'Software',
    });

    expect(result).toBeInstanceOf(Professor);
    expect(result.id).toBe('uuid-1');
    expect(result.specialization).toBe('Software');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(professorRepository.save).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(professorRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'uuid-1', specialization: 'Software' }),
    );
  });

  it('should throw NotFoundException when professor does not exist', async () => {
    professorRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('uuid-1', { specialization: 'Sistemas' }),
    ).rejects.toThrow(NotFoundException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(professorRepository.save).not.toHaveBeenCalled();
  });
});
