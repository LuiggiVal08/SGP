import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IDefenseRepository } from '../../domain/ports/IDefenseRepository';
import { Defense } from '../../domain/entities/Defense';
import { JudgeType } from '@modules/defense-judges/domain/entities/DefenseJudge';

const REQUIRED_JUDGE_TYPES: JudgeType[] = [
  'SUBJECT_PROFESSOR',
  'ACADEMIC_TUTOR',
  'COMMUNITY_TUTOR',
];

export interface ScheduleJudgeInput {
  judgeType: JudgeType;
  professorId?: string | null;
  communityTutorId?: string | null;
}

@Injectable()
export class ScheduleDefenseUseCase {
  constructor(
    @Inject('IDefenseRepository')
    private readonly defenseRepository: IDefenseRepository,
  ) {}

  async execute(data: {
    projectId: string;
    scheduledDate: Date;
    judges?: ScheduleJudgeInput[];
  }) {
    const existing = await this.defenseRepository.findByProject(data.projectId);
    if (existing) {
      throw new NotFoundException(
        'El proyecto ya tiene una defensa programada',
      );
    }

    this.validateRequiredJudges(data.judges ?? []);

    const defense = new Defense(
      randomUUID(),
      data.projectId,
      data.scheduledDate,
      null,
      'PROGRAMADA',
    );
    await this.defenseRepository.save(defense);
    return defense;
  }

  private validateRequiredJudges(judges: ScheduleJudgeInput[]): void {
    const present = new Set(judges.map((j) => j.judgeType));
    const missing = REQUIRED_JUDGE_TYPES.filter((type) => !present.has(type));
    if (missing.length > 0) {
      throw new BadRequestException(
        `Jurados obligatorios faltantes: ${missing.join(', ')}. ` +
          `Una defensa requiere los jurados ${REQUIRED_JUDGE_TYPES.join(', ')}.`,
      );
    }
  }
}
