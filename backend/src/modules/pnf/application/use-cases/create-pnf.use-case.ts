import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IPnfRepository } from '../../domain/ports/IPnfRepository';
import { Pnf } from '../../domain/entities/Pnf';

@Injectable()
export class CreatePnfUseCase {
  constructor(
    @Inject('IPnfRepository')
    private readonly pnfRepository: IPnfRepository,
    @Inject('IInstitutionRepository')
    private readonly institutionRepository: {
      findById: (id: string) => Promise<{ id: string } | null>;
    },
    @Inject('IProfessorRepository')
    private readonly professorRepository: {
      findById: (id: string) => Promise<{ id: string } | null>;
    },
  ) {}

  async execute(name: string, institutionId: string, coordinatorId?: string) {
    const institution =
      await this.institutionRepository.findById(institutionId);
    if (!institution) {
      throw new NotFoundException('Institución no encontrada');
    }
    if (coordinatorId) {
      const coordinator =
        await this.professorRepository.findById(coordinatorId);
      if (!coordinator) {
        throw new NotFoundException('Coordinador (profesor) no encontrado');
      }
    }
    const pnf = new Pnf(randomUUID(), name, institutionId, coordinatorId);
    await this.pnfRepository.save(pnf);
    return pnf;
  }
}
