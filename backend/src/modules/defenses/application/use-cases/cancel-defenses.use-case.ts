import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IDefenseRepository } from '../../domain/ports/IDefenseRepository';
import { Defense } from '../../domain/entities/Defense';

@Injectable()
export class CancelDefenseUseCase {
  constructor(
    @Inject('IDefenseRepository')
    private readonly defenseRepository: IDefenseRepository,
  ) {}

  async execute(id: string) {
    const defense = await this.defenseRepository.findById(id);
    if (!defense) {
      throw new NotFoundException('Defensa no encontrada');
    }
    const updated = new Defense(
      defense.id,
      defense.projectId,
      defense.scheduledDate,
      defense.actualDate,
      'CANCELADA',
    );
    await this.defenseRepository.save(updated);
    return updated;
  }
}
