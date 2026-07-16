import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ProjectTagModel } from './models/project-tag.model';
import { TagModel } from '@modules/tags/infrastructure/persistence/sequelize/models/tag.model';
import { IProjectTagRepository } from '../../../domain/ports/IProjectTagRepository';

@Injectable()
export class ProjectTagSequelizeAdapter implements IProjectTagRepository {
  constructor(
    @InjectModel(ProjectTagModel)
    private readonly projectTagModel: typeof ProjectTagModel,
  ) {}

  async assign(projectId: string, tagId: string): Promise<void> {
    await this.projectTagModel.findOrCreate({
      where: { projectId, tagId },
      defaults: { projectId, tagId },
    });
  }

  async remove(projectId: string, tagId: string): Promise<void> {
    await this.projectTagModel.destroy({ where: { projectId, tagId } });
  }

  async findByProject(
    projectId: string,
  ): Promise<{ id: string; name: string; category: string }[]> {
    const rows = await this.projectTagModel.findAll({
      where: { projectId },
      include: [TagModel],
    });
    return rows.map((r) => {
      const tag = (r as unknown as { tag: TagModel }).tag;
      return { id: tag.id, name: tag.name, category: tag.category };
    });
  }
}
