import { Injectable, Inject } from '@nestjs/common';
import { IDefenseRepository } from '../../domain/ports/IDefenseRepository';

@Injectable()
export class GetDefenseByProjectUseCase {
  constructor(
    @Inject('IDefenseRepository')
    private readonly defenseRepository: IDefenseRepository,
  ) {}

  async execute(projectId: string) {
    return this.defenseRepository.findByProject(projectId);
  }
}

@Injectable()
export class GetAllDefensesUseCase {
  constructor(
    @Inject('IDefenseRepository')
    private readonly defenseRepository: IDefenseRepository,
  ) {}

  async execute() {
    return this.defenseRepository.findAll();
  }
}
