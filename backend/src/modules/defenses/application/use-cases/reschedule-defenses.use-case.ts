import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IDefenseRepository } from '../../domain/ports/IDefenseRepository';
import { IDefenseScheduleChangeRepository } from '../../domain/ports/IDefenseScheduleChangeRepository';
import { Defense } from '../../domain/entities/Defense';
import { DefenseScheduleChange } from '../../domain/entities/DefenseScheduleChange';

@Injectable()
export class RescheduleDefenseUseCase {
  constructor(
    @Inject('IDefenseRepository')
    private readonly defenseRepository: IDefenseRepository,
    @Inject('IDefenseScheduleChangeRepository')
    private readonly scheduleChangeRepository: IDefenseScheduleChangeRepository,
  ) {}

  async execute(data: {
    id: string;
    scheduledDate: Date;
    reason?: string;
    changedBy?: string;
  }) {
    const defense = await this.defenseRepository.findById(data.id);
    if (!defense) {
      throw new NotFoundException('Defensa no encontrada');
    }

    const change = new DefenseScheduleChange(
      randomUUID(),
      defense.id,
      defense.scheduledDate,
      data.scheduledDate,
      data.changedBy ?? '',
      data.reason ?? '',
    );
    await this.scheduleChangeRepository.save(change);

    const updated = new Defense(
      defense.id,
      defense.projectId,
      data.scheduledDate,
      defense.actualDate,
      'APLAZADA',
    );
    await this.defenseRepository.save(updated);
    return updated;
  }
}
