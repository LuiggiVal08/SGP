import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IDefenseRepository } from '../../domain/ports/IDefenseRepository';
import { Defense } from '../../domain/entities/Defense';

@Injectable()
export class RescheduleDefenseUseCase {
  constructor(
    @Inject('IDefenseRepository')
    private readonly defenseRepository: IDefenseRepository,
  ) {}

  async execute(data: { id: string; scheduledDate: Date }) {
    const defense = await this.defenseRepository.findById(data.id);
    if (!defense) {
      throw new NotFoundException('Defensa no encontrada');
    }
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
