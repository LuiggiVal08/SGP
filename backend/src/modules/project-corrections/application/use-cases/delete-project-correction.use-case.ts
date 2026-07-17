import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IProjectCorrectionRepository } from '../../domain/ports/IProjectCorrectionRepository';

@Injectable()
export class DeleteProjectCorrectionUseCase {
  constructor(
    @Inject('IProjectCorrectionRepository')
    private readonly correctionRepository: IProjectCorrectionRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const correction = await this.correctionRepository.findById(id);
    if (!correction) {
      throw new NotFoundException('Corrección no encontrada');
    }
    await this.correctionRepository.delete(id);
  }
}
