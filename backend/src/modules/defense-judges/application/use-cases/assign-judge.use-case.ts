import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IDefenseJudgeRepository } from '../../domain/ports/IDefenseJudgeRepository';
import { DefenseJudge, JudgeType } from '../../domain/entities/DefenseJudge';

const VALID_JUDGE_TYPES: JudgeType[] = [
  'SUBJECT_PROFESSOR',
  'ACADEMIC_TUTOR',
  'COMMUNITY_TUTOR',
];

const MAX_JUDGES = 3;

@Injectable()
export class AssignJudgeUseCase {
  constructor(
    @Inject('IDefenseJudgeRepository')
    private readonly defenseJudgeRepository: IDefenseJudgeRepository,
  ) {}

  async execute(data: {
    defenseId: string;
    judgeType: JudgeType;
    professorId?: string | null;
    communityTutorId?: string | null;
  }) {
    this.validate(data.judgeType, data.professorId, data.communityTutorId);

    const count = await this.defenseJudgeRepository.countByDefense(
      data.defenseId,
    );
    if (count >= MAX_JUDGES) {
      throw new BadRequestException(
        `La defensa ya tiene el máximo de ${MAX_JUDGES} jurados`,
      );
    }

    const judge = new DefenseJudge(
      randomUUID(),
      data.defenseId,
      data.judgeType,
      data.professorId ?? null,
      data.communityTutorId ?? null,
    );
    await this.defenseJudgeRepository.save(judge);
    return judge;
  }

  private validate(
    judgeType: JudgeType,
    professorId: string | undefined | null,
    communityTutorId: string | undefined | null,
  ): void {
    if (!VALID_JUDGE_TYPES.includes(judgeType)) {
      throw new BadRequestException(
        `judgeType inválido. Valores permitidos: ${VALID_JUDGE_TYPES.join(', ')}`,
      );
    }

    const hasProfessor = !!professorId;
    const hasCommunity = !!communityTutorId;

    if (judgeType === 'COMMUNITY_TUTOR') {
      if (!hasCommunity || hasProfessor) {
        throw new BadRequestException(
          'COMMUNITY_TUTOR requiere communityTutorId y no professorId',
        );
      }
    } else {
      if (!hasProfessor || hasCommunity) {
        throw new BadRequestException(
          `${judgeType} requiere professorId y no communityTutorId`,
        );
      }
    }
  }
}
