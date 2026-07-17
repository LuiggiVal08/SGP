import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IDefenseRepository } from '../../domain/ports/IDefenseRepository';

@Injectable()
export class GetDefenseByIdUseCase {
  constructor(
    @Inject('IDefenseRepository')
    private readonly defenseRepository: IDefenseRepository,
  ) {}

  async execute(id: string) {
    const defense = await this.defenseRepository.findById(id);
    if (!defense) {
      throw new NotFoundException('Defensa no encontrada');
    }
    return defense;
  }
}

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
