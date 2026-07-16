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
      countByDefense: jest.fn().mockResolvedValue(0),
      save: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new AssignJudgeUseCase(defenseJudgeRepository);
  });

  it('should assign a SUBJECT_PROFESSOR judge with professorId', async () => {
    const result = await useCase.execute({
      defenseId: 'def-1',
      judgeType: 'SUBJECT_PROFESSOR',
      professorId: 'prof-1',
      communityTutorId: null,
    });

    expect(result).toBeInstanceOf(DefenseJudge);
    expect(result.judgeType).toBe('SUBJECT_PROFESSOR');
    expect(result.professorId).toBe('prof-1');
    expect(result.communityTutorId).toBeNull();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(defenseJudgeRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should assign a COMMUNITY_TUTOR judge with communityTutorId', async () => {
    const result = await useCase.execute({
      defenseId: 'def-1',
      judgeType: 'COMMUNITY_TUTOR',
      professorId: null,
      communityTutorId: 'ct-1',
    });

    expect(result.judgeType).toBe('COMMUNITY_TUTOR');
    expect(result.communityTutorId).toBe('ct-1');
    expect(result.professorId).toBeNull();
  });

  it('should throw BadRequestException when SUBJECT_PROFESSOR has no professorId', async () => {
    await expect(
      useCase.execute({
        defenseId: 'def-1',
        judgeType: 'SUBJECT_PROFESSOR',
        professorId: null,
        communityTutorId: null,
      }),
    ).rejects.toThrow(BadRequestException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(defenseJudgeRepository.save).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when COMMUNITY_TUTOR has professorId', async () => {
    await expect(
      useCase.execute({
        defenseId: 'def-1',
        judgeType: 'COMMUNITY_TUTOR',
        professorId: 'prof-1',
        communityTutorId: 'ct-1',
      }),
    ).rejects.toThrow(BadRequestException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(defenseJudgeRepository.save).not.toHaveBeenCalled();
  });

  it('should throw BadRequestException when max judges reached', async () => {
    defenseJudgeRepository.countByDefense.mockResolvedValue(3);

    await expect(
      useCase.execute({
        defenseId: 'def-1',
        judgeType: 'SUBJECT_PROFESSOR',
        professorId: 'prof-1',
      }),
    ).rejects.toThrow(BadRequestException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(defenseJudgeRepository.save).not.toHaveBeenCalled();
  });
});
