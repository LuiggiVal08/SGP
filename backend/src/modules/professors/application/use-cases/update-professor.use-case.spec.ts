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
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new UpdateProfessorUseCase(professorRepository);
  });

  it('should create/persist a professor profile with specialization', async () => {
    professorRepository.findById.mockResolvedValue(null);
    professorRepository.save.mockResolvedValue(undefined);

    const result = await useCase.execute('uuid-1', {
      specialization: 'Sistemas',
    });

    expect(result).toBeInstanceOf(Professor);
    expect(result.id).toBe('uuid-1');
    expect(result.specialization).toBe('Sistemas');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(professorRepository.save).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(professorRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'uuid-1', specialization: 'Sistemas' }),
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
