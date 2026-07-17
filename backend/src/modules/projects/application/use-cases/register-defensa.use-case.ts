import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { DefensaResultData } from '../../domain/entities/Project';
import { randomUUID } from 'crypto';

interface RegisterDefensaInput {
  projectId: string;
  registeredBy: string;
  juezDocente: string;
  juezTutorInstitucional: string;
  juezTutorComunitario: string;
  notaGrupal: number;
  notasIndividuales: Record<string, number>;
}

@Injectable()
export class RegisterDefensaUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(input: RegisterDefensaInput) {
    const project = await this.projectRepository.findById(input.projectId);
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const data: DefensaResultData = {
      id: randomUUID(),
      projectId: input.projectId,
      registeredBy: input.registeredBy,
      juezDocente: input.juezDocente,
      juezTutorInstitucional: input.juezTutorInstitucional,
      juezTutorComunitario: input.juezTutorComunitario,
      notaGrupal: input.notaGrupal,
      notasIndividuales: input.notasIndividuales,
      cartaAprobacionUrl: null,
    };

    const result = await this.projectRepository.saveDefensa(data);

    const milestones = await this.projectRepository.findMilestonesByProject(
      input.projectId,
    );
    const defensaMilestone = milestones.find((m) => m.type === 'DEFENSA');
    if (defensaMilestone) {
      await this.projectRepository.updateMilestoneStatus(
        defensaMilestone.id,
        'APPROVED',
        input.registeredBy,
      );
    }

    return result;
  }
}
