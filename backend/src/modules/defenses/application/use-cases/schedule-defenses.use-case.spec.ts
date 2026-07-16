import { ScheduleDefenseUseCase } from './schedule-defenses.use-case';
import { IDefenseRepository } from '../../domain/ports/IDefenseRepository';
import { Defense } from '../../domain/entities/Defense';
import { NotFoundException } from '@nestjs/common';

describe('ScheduleDefenseUseCase', () => {
  let useCase: ScheduleDefenseUseCase;
  let defenseRepository: jest.Mocked<IDefenseRepository>;

  const scheduledDate = new Date('2026-09-01T10:00:00Z');

  beforeEach(() => {
    defenseRepository = {
      findById: jest.fn(),
      findByProject: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new ScheduleDefenseUseCase(defenseRepository);
  });

  it('should schedule a defense with PROGRAMADA status for the project', async () => {
    defenseRepository.findByProject.mockResolvedValue(null);

    const result = await useCase.execute({
      projectId: 'proj-1',
      scheduledDate,
    });

    expect(result).toBeInstanceOf(Defense);
    expect(result.projectId).toBe('proj-1');
    expect(result.status).toBe('PROGRAMADA');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(defenseRepository.save).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(defenseRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'proj-1',
        status: 'PROGRAMADA',
      }),
    );
  });

  it('should throw NotFoundException when the project already has a defense', async () => {
    defenseRepository.findByProject.mockResolvedValue(
      new Defense('def-1', 'proj-1', scheduledDate, null, 'PROGRAMADA'),
    );

    await expect(
      useCase.execute({ projectId: 'proj-1', scheduledDate }),
    ).rejects.toThrow(NotFoundException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(defenseRepository.save).not.toHaveBeenCalled();
  });
});
