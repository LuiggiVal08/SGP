import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IDefenseJudgeRepository } from '../../domain/ports/IDefenseJudgeRepository';
import { DefenseJudge, JudgeType } from '../../domain/entities/DefenseJudge';

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
    const judge = new DefenseJudge(
      randomUUID(),
      data.defenseId,
      data.judgeType,
      data.professorId ?? null,
      data.communityTutorId ?? null,
      null,
    );
    await this.defenseJudgeRepository.save(judge);
    return judge;
  }

  private validate(
    judgeType: JudgeType,
    professorId: string | undefined | null,
    communityTutorId: string | undefined | null,
  ): void {
    const hasProfessor = !!professorId;
    const hasCommunity = !!communityTutorId;
    if (judgeType === 'TUTOR_COMUNITARIO') {
      if (!hasCommunity || hasProfessor) {
        throw new BadRequestException(
          'TUTOR_COMUNITARIO requiere communityTutorId y no professorId',
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
