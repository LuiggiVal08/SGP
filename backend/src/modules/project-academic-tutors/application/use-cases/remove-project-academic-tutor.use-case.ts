import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IProjectAcademicTutorRepository } from '../../domain/ports/IProjectAcademicTutorRepository';
import { IProjectRepository } from '@modules/projects/domain/ports/IProjectRepository';

@Injectable()
export class RemoveProjectAcademicTutorUseCase {
  constructor(
    @Inject('IProjectAcademicTutorRepository')
    private readonly tutorRepository: IProjectAcademicTutorRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(projectId: string, professorId: string): Promise<void> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    await this.tutorRepository.remove(projectId, professorId);
  }
}
