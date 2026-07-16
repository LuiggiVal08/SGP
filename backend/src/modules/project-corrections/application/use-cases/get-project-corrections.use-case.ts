import { Injectable, Inject } from '@nestjs/common';
import { IProjectCorrectionRepository } from '../../domain/ports/IProjectCorrectionRepository';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';
import { ProjectCorrection } from '../../domain/entities/ProjectCorrection';

@Injectable()
export class GetProjectCorrectionsUseCase {
  constructor(
    @Inject('IProjectCorrectionRepository')
    private readonly correctionRepository: IProjectCorrectionRepository,
  ) {}

  async execute(
    projectId: string,
    dto: PaginationDto,
  ): Promise<PaginatedResult<ProjectCorrection>> {
    return this.correctionRepository.findAllByProjectPaginated(projectId, dto);
  }
}
