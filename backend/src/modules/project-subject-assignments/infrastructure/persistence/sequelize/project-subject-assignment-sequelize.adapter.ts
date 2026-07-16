import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { IProjectSubjectAssignmentRepository } from '../../../domain/ports/IProjectSubjectAssignmentRepository';
import { ProjectSubjectAssignment } from '../../../domain/entities/ProjectSubjectAssignment';
import { ProjectSubjectAssignmentModel } from './models/project-subject-assignment.model';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

@Injectable()
export class ProjectSubjectAssignmentSequelizeAdapter implements IProjectSubjectAssignmentRepository {
  constructor(
    @InjectModel(ProjectSubjectAssignmentModel)
    private readonly assignmentModel: typeof ProjectSubjectAssignmentModel,
  ) {}

  private toDomain(
    model: ProjectSubjectAssignmentModel,
  ): ProjectSubjectAssignment {
    return new ProjectSubjectAssignment(
      model.id,
      model.subjectId,
      model.professorId,
      model.periodId,
    );
  }

  async findById(id: string): Promise<ProjectSubjectAssignment | null> {
    const model = await this.assignmentModel.findByPk(id);
    return model ? this.toDomain(model) : null;
  }

  async findAllPaginated(
    dto: PaginationDto,
  ): Promise<PaginatedResult<ProjectSubjectAssignment>> {
    const page = dto.page && dto.page > 0 ? dto.page : 1;
    const limit = dto.limit && dto.limit > 0 ? dto.limit : 10;
    const offset = (page - 1) * limit;

    const { rows, count } = await this.assignmentModel.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      data: rows.map((r) => this.toDomain(r)),
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findByUnique(
    subjectId: string,
    professorId: string,
    periodId: string,
  ): Promise<ProjectSubjectAssignment | null> {
    const model = await this.assignmentModel.findOne({
      where: {
        subjectId,
        professorId,
        periodId,
      } as any,
    });
    return model ? this.toDomain(model) : null;
  }

  async save(assignment: ProjectSubjectAssignment): Promise<void> {
    await this.assignmentModel.upsert({
      id: assignment.id,
      subjectId: assignment.subjectId,
      professorId: assignment.professorId,
      periodId: assignment.periodId,
    });
  }

  async delete(id: string): Promise<void> {
    await this.assignmentModel.destroy({ where: { id } });
  }
}
