import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { ProjectAuthorModel } from '../../infrastructure/persistence/sequelize/models/project-author.model';

@Injectable()
export class RemoveProjectAuthorUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @InjectModel(ProjectAuthorModel)
    private readonly authorModel: typeof ProjectAuthorModel,
  ) {}

  async execute(projectId: string, studentId: string): Promise<void> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.authorModel.destroy({ where: { projectId, studentId } });
  }
}
