import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IProjectCorrectionRepository } from '../../domain/ports/IProjectCorrectionRepository';
import { IProjectRepository } from '@modules/projects/domain/ports/IProjectRepository';
import { ProjectCorrection } from '../../domain/entities/ProjectCorrection';

interface CreateProjectCorrectionInput {
  projectId: string;
  fileId: string;
  comment?: string;
  createdBy?: string;
}

@Injectable()
export class CreateProjectCorrectionUseCase {
  constructor(
    @Inject('IProjectCorrectionRepository')
    private readonly correctionRepository: IProjectCorrectionRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(input: CreateProjectCorrectionInput) {
    const project = await this.projectRepository.findById(input.projectId);
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const file = await this.projectRepository.findFileById(input.fileId);
    if (!file) {
      throw new NotFoundException('Archivo no encontrado');
    }

    if (file.projectId !== input.projectId) {
      throw new BadRequestException('El archivo no pertenece al proyecto');
    }

    if (file.documentType !== 'TOMO') {
      throw new BadRequestException(
        'Las correcciones solo pueden crearse sobre el TOMO',
      );
    }

    const correction = new ProjectCorrection(
      randomUUID(),
      input.projectId,
      input.fileId,
      input.comment ?? null,
      'PENDIENTE',
      input.createdBy ?? null,
      null,
    );

    await this.correctionRepository.save(correction);
    return correction;
  }
}
