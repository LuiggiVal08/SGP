import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IDefenseEvaluationRepository } from '../../domain/ports/IDefenseEvaluationRepository';
import { DefenseEvaluation } from '../../domain/entities/DefenseEvaluation';

@Injectable()
export class SubmitEvaluationUseCase {
  constructor(
    @Inject('IDefenseEvaluationRepository')
    private readonly defenseEvaluationRepository: IDefenseEvaluationRepository,
  ) {}

  async execute(data: { judgeId: string; score: number; comments: string }) {
    const existing = await this.defenseEvaluationRepository.findByJudge(
      data.judgeId,
    );
    if (existing) {
      throw new ConflictException(
        'El jurado ya tiene una evaluación registrada',
      );
    }
    const evaluation = new DefenseEvaluation(
      randomUUID(),
      data.judgeId,
      data.score,
      data.comments,
    );
    await this.defenseEvaluationRepository.save(evaluation);
    return evaluation;
  }
}

@Injectable()
export class ListEvaluationsByDefenseUseCase {
  constructor(
    @Inject('IDefenseEvaluationRepository')
    private readonly defenseEvaluationRepository: IDefenseEvaluationRepository,
  ) {}

  async execute(defenseId: string) {
    return this.defenseEvaluationRepository.findByDefenseId(defenseId);
  }
}

@Injectable()
export class GetAllEvaluationsUseCase {
  constructor(
    @Inject('IDefenseEvaluationRepository')
    private readonly defenseEvaluationRepository: IDefenseEvaluationRepository,
  ) {}

  async execute() {
    return this.defenseEvaluationRepository.findAll();
  }
}
