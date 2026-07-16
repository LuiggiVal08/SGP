import { CancelDefenseUseCase } from './cancel-defenses.use-case';
import { IDefenseRepository } from '../../domain/ports/IDefenseRepository';
import { Defense } from '../../domain/entities/Defense';
import { NotFoundException } from '@nestjs/common';

describe('CancelDefenseUseCase', () => {
  let useCase: CancelDefenseUseCase;
  let defenseRepository: jest.Mocked<IDefenseRepository>;

  const existing = new Defense(
    'def-1',
    'proj-1',
    new Date('2026-09-01T10:00:00Z'),
    null,
    'PROGRAMADA',
  );

  beforeEach(() => {
    defenseRepository = {
      findById: jest.fn(),
      findByProject: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new CancelDefenseUseCase(defenseRepository);
  });

  it('should mark a defense as CANCELADA', async () => {
    defenseRepository.findById.mockResolvedValue(existing);

    const result = await useCase.execute('def-1');

    expect(result.status).toBe('CANCELADA');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(defenseRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'def-1', status: 'CANCELADA' }),
    );
  });

  it('should throw NotFoundException when the defense does not exist', async () => {
    defenseRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('def-1')).rejects.toThrow(NotFoundException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(defenseRepository.save).not.toHaveBeenCalled();
  });
});
