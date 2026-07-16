import { AssignJudgeUseCase } from './assign-judge.use-case';
import { IDefenseJudgeRepository } from '../../domain/ports/IDefenseJudgeRepository';
import { DefenseJudge } from '../../domain/entities/DefenseJudge';
import { BadRequestException } from '@nestjs/common';

describe('AssignJudgeUseCase', () => {
  let useCase: AssignJudgeUseCase;
  let defenseJudgeRepository: jest.Mocked<IDefenseJudgeRepository>;

  beforeEach(() => {
    defenseJudgeRepository = {
      findById: jest.fn(),
      findByDefense: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new AssignJudgeUseCase(defenseJudgeRepository);
  });

  it('should assign a DOCENTE judge with professorId', async () => {
    const result = await useCase.execute({
      defenseId: 'def-1',
      judgeType: 'DOCENTE',
      professorId: 'prof-1',
      communityTutorId: null,
    });

    expect(result).toBeInstanceOf(DefenseJudge);
    expect(result.judgeType).toBe('DOCENTE');
    expect(result.professorId).toBe('prof-1');
    expect(result.communityTutorId).toBeNull();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(defenseJudgeRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should assign a TUTOR_COMUNITARIO judge with communityTutorId', async () => {
    const result = await useCase.execute({
      defenseId: 'def-1',
      judgeType: 'TUTOR_COMUNITARIO',
      professorId: null,
      communityTutorId: 'ct-1',
    });

    expect(result.judgeType).toBe('TUTOR_COMUNITARIO');
    expect(result.communityTutorId).toBe('ct-1');
    expect(result.professorId).toBeNull();
  });

  it('should throw BadRequestException when DOCENTE has no professorId', async () => {
    await expect(
      useCase.execute({
        defenseId: 'def-1',
        judgeType: 'DOCENTE',
        professorId: null,
        communityTutorId: null,
      }),
    ).rejects.toThrow(BadRequestException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(defenseJudgeRepository.save).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when TUTOR_COMUNITARIO has professorId', async () => {
    await expect(
      useCase.execute({
        defenseId: 'def-1',
        judgeType: 'TUTOR_COMUNITARIO',
        professorId: 'prof-1',
        communityTutorId: 'ct-1',
      }),
    ).rejects.toThrow(BadRequestException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(defenseJudgeRepository.save).not.toHaveBeenCalled();
  });
});
