import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { IProjectCorrectionRepository } from '../../../domain/ports/IProjectCorrectionRepository';
import { ProjectCorrection } from '../../../domain/entities/ProjectCorrection';
import { ProjectCorrectionModel } from './models/project-correction.model';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

@Injectable()
export class ProjectCorrectionSequelizeAdapter implements IProjectCorrectionRepository {
  constructor(
    @InjectModel(ProjectCorrectionModel)
    private readonly projectCorrectionModel: typeof ProjectCorrectionModel,
  ) {}

  private toDomain(
    model: ProjectCorrectionModel | null,
  ): ProjectCorrection | null {
    if (!model) return null;
    return new ProjectCorrection(
      model.id,
      model.projectId,
      model.fileId,
      model.comment,
      model.status as ProjectCorrection['status'],
      model.createdBy,
      model.resolvedAt,
    );
  }

  async findById(id: string): Promise<ProjectCorrection | null> {
    const correction = await this.projectCorrectionModel.findByPk(id);
    return this.toDomain(correction);
  }

  async findAllByProjectPaginated(
    projectId: string,
    dto: PaginationDto,
  ): Promise<PaginatedResult<ProjectCorrection>> {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 10, 100);

    const where: Record<string | symbol, unknown> = { projectId };
    if (dto.search) {
      where[Op.or] = [{ comment: { [Op.like]: `%${dto.search}%` } }];
    }

    const { rows, count } = await this.projectCorrectionModel.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
    });

    return {
      data: rows.map((r) => this.toDomain(r) as ProjectCorrection),
      meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    };
  }

  async save(correction: ProjectCorrection): Promise<void> {
    await this.projectCorrectionModel.upsert({
      id: correction.id,
      projectId: correction.projectId,
      fileId: correction.fileId,
      comment: correction.comment,
      status: correction.status,
      createdBy: correction.createdBy,
      resolvedAt: correction.resolvedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.projectCorrectionModel.destroy({ where: { id } });
  }
}
