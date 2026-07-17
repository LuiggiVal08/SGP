import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IProjectAcademicTutorRepository } from '../../domain/ports/IProjectAcademicTutorRepository';
import { IProjectRepository } from '@modules/projects/domain/ports/IProjectRepository';
import { ProjectAcademicTutor } from '../../domain/entities/ProjectAcademicTutor';

@Injectable()
export class ListProjectAcademicTutorsUseCase {
  constructor(
    @Inject('IProjectAcademicTutorRepository')
    private readonly tutorRepository: IProjectAcademicTutorRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(projectId: string): Promise<ProjectAcademicTutor[]> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return this.tutorRepository.findByProject(projectId);
  }
}
