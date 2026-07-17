import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IPnfRepository } from '../../domain/ports/IPnfRepository';
import { Pnf } from '../../domain/entities/Pnf';

@Injectable()
export class UpdatePnfUseCase {
  constructor(
    @Inject('IPnfRepository')
    private readonly pnfRepository: IPnfRepository,
    @Inject('IProfessorRepository')
    private readonly professorRepository: {
      findById: (id: string) => Promise<{ id: string } | null>;
    },
  ) {}

  async execute(
    id: string,
    name: string,
    institutionId?: string,
    coordinatorId?: string,
  ) {
    const existing = await this.pnfRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('PNF not found');
    }
    if (coordinatorId) {
      const coordinator =
        await this.professorRepository.findById(coordinatorId);
      if (!coordinator) {
        throw new NotFoundException('Coordinador (profesor) no encontrado');
      }
    }
    const pnf = new Pnf(
      id,
      name,
      institutionId ?? existing.institutionId,
      coordinatorId ?? existing.coordinatorId,
    );
    await this.pnfRepository.save(pnf);
    return pnf;
  }
}
