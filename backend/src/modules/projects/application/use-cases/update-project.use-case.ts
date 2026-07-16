import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';

interface UpdateProjectInput {
  id: string;
  title?: string;
  description?: string;
  problemStatement?: string;
  subjectAssignmentId?: string;
  locationId?: string;
  communityTutorId?: string;
  status?: string;
  cdSubmitted?: boolean;
}

@Injectable()
export class UpdateProjectUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('ICacheService')
    private readonly cacheService: ICacheService,
  ) {}

  async execute(input: UpdateProjectInput) {
    const existing = await this.projectRepository.findById(input.id);
    if (!existing) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const updateData: Record<string, unknown> = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.problemStatement !== undefined)
      updateData.problemStatement = input.problemStatement;
    if (input.subjectAssignmentId !== undefined)
      updateData.subjectAssignmentId = input.subjectAssignmentId;
    if (input.locationId !== undefined)
      updateData.locationId = input.locationId;
    if (input.communityTutorId !== undefined)
      updateData.communityTutorId = input.communityTutorId;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.cdSubmitted !== undefined)
      updateData.cdSubmitted = input.cdSubmitted;

    const result = await this.projectRepository.update(input.id, updateData);
    await this.cacheService.delete('projects:all');
    return result;
  }
}
