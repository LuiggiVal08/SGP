import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IDefenseRepository } from '../../domain/ports/IDefenseRepository';
import { Defense } from '../../domain/entities/Defense';

@Injectable()
export class ScheduleDefenseUseCase {
  constructor(
    @Inject('IDefenseRepository')
    private readonly defenseRepository: IDefenseRepository,
  ) {}

  async execute(data: { projectId: string; scheduledDate: Date }) {
    const existing = await this.defenseRepository.findByProject(data.projectId);
    if (existing) {
      throw new NotFoundException(
        'El proyecto ya tiene una defensa programada',
      );
    }
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
}
