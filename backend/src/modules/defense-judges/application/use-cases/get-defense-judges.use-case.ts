import { Injectable, Inject } from '@nestjs/common';
import { IDefenseJudgeRepository } from '../../domain/ports/IDefenseJudgeRepository';

@Injectable()
export class ListJudgesByDefenseUseCase {
  constructor(
    @Inject('IDefenseJudgeRepository')
    private readonly defenseJudgeRepository: IDefenseJudgeRepository,
  ) {}

  async execute(defenseId: string) {
    return this.defenseJudgeRepository.findByDefense(defenseId);
  }
}

@Injectable()
export class RemoveJudgeUseCase {
  constructor(
    @Inject('IDefenseJudgeRepository')
    private readonly defenseJudgeRepository: IDefenseJudgeRepository,
  ) {}

  async execute(id: string): Promise<void> {
    await this.defenseJudgeRepository.delete(id);
  }
}
