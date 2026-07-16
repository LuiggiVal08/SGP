import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IProjectCorrectionRepository } from '../../domain/ports/IProjectCorrectionRepository';
import { ProjectCorrection } from '../../domain/entities/ProjectCorrection';

@Injectable()
export class ResolveProjectCorrectionUseCase {
  constructor(
    @Inject('IProjectCorrectionRepository')
    private readonly correctionRepository: IProjectCorrectionRepository,
  ) {}

  async execute(id: string) {
    const correction = await this.correctionRepository.findById(id);
    if (!correction) {
      throw new NotFoundException('Corrección no encontrada');
    }

    if (correction.status === 'RESUELTA') {
      throw new BadRequestException('La corrección ya está resuelta');
    }

    const resolved = new ProjectCorrection(
      correction.id,
      correction.projectId,
      correction.fileId,
      correction.comment,
      'RESUELTA',
      correction.createdBy,
      new Date(),
    );

    await this.correctionRepository.save(resolved);
    return resolved;
  }
}
