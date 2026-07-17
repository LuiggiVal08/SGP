import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { IProjectAcademicTutorRepository } from '../../../domain/ports/IProjectAcademicTutorRepository';
import { ProjectAcademicTutor } from '../../../domain/entities/ProjectAcademicTutor';
import { ProjectAcademicTutorModel } from './models/project-academic-tutor.model';

@Injectable()
export class ProjectAcademicTutorSequelizeAdapter implements IProjectAcademicTutorRepository {
  constructor(
    @InjectModel(ProjectAcademicTutorModel)
    private readonly tutorModel: typeof ProjectAcademicTutorModel,
  ) {}

  private toDomain(model: ProjectAcademicTutorModel): ProjectAcademicTutor {
    return new ProjectAcademicTutor(
      model.id,
      model.projectId,
      model.professorId,
      model.assignedAt as Date,
      model.active,
    );
  }

  async findByProject(projectId: string): Promise<ProjectAcademicTutor[]> {
    const models = await this.tutorModel.findAll({ where: { projectId } });
    return models.map((m) => this.toDomain(m));
  }

  async findByUnique(
    projectId: string,
    professorId: string,
  ): Promise<ProjectAcademicTutor | null> {
    const model = await this.tutorModel.findOne({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: {
        projectId,
        professorId,
      } as any,
    });
    return model ? this.toDomain(model) : null;
  }

  async save(tutor: ProjectAcademicTutor): Promise<void> {
    await this.tutorModel.upsert({
      id: tutor.id,
      projectId: tutor.projectId,
      professorId: tutor.professorId,
      assignedAt: tutor.assignedAt,
      active: tutor.active,
    });
  }

  async remove(projectId: string, professorId: string): Promise<void> {
    await this.tutorModel.destroy({ where: { projectId, professorId } });
  }
}
