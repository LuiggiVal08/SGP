import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { IProjectRepository } from '../../../domain/ports/IProjectRepository';
import { Project, ProjectStatus } from '../../../domain/entities/Project';
import { ProjectFile, FileType } from '../../../domain/entities/ProjectFile';
import { ProjectModel } from './models/project.model';
import { ProjectFileModel } from './models/project-file.model';
import { ProjectAuthorModel } from './models/project-author.model';
import { UserModel } from '@modules/users/infrastructure/persistence/sequelize/models/user.model';
import { CareerModel } from '@modules/careers/infrastructure/persistence/sequelize/models/career.model';

@Injectable()
export class ProjectSequelizeAdapter implements IProjectRepository {
  constructor(
    @InjectModel(ProjectModel)
    private readonly projectModel: typeof ProjectModel,
    @InjectModel(ProjectFileModel)
    private readonly projectFileModel: typeof ProjectFileModel,
    @InjectModel(ProjectAuthorModel)
    private readonly projectAuthorModel: typeof ProjectAuthorModel,
    private readonly sequelize: Sequelize,
  ) {}

  private toDomain(model: ProjectModel): Project {
    return new Project(
      model.id,
      model.title,
      model.year,
      model.status as ProjectStatus,
      model.careerId,
      model.tutorId,
    );
  }

  async findById(id: string): Promise<Project | null> {
    const project = await this.projectModel.findByPk(id, {
      include: [UserModel, CareerModel, ProjectFileModel],
    });
    return project ? this.toDomain(project) : null;
  }

  async findAll(): Promise<Project[]> {
    const projects = await this.projectModel.findAll({
      include: [
        { model: UserModel, as: 'authors' },
        { model: UserModel, as: 'tutor' },
        CareerModel,
        ProjectFileModel,
      ],
    });
    return projects.map((p) => this.toDomain(p));
  }

  async findByStatus(status: ProjectStatus): Promise<Project[]> {
    const projects = await this.projectModel.findAll({ where: { status } });
    return projects.map((p) => this.toDomain(p));
  }

  async findByCareer(careerId: string): Promise<Project[]> {
    const projects = await this.projectModel.findAll({ where: { careerId } });
    return projects.map((p) => this.toDomain(p));
  }

  async findByTutor(tutorId: string): Promise<Project[]> {
    const projects = await this.projectModel.findAll({ where: { tutorId } });
    return projects.map((p) => this.toDomain(p));
  }

  async save(project: Project, authorIds: string[]): Promise<Project> {
    const transaction = await this.sequelize.transaction();
    try {
      const [created] = await this.projectModel.upsert(
        {
          id: project.id,
          title: project.title,
          year: project.year,
          status: project.status,
          careerId: project.careerId,
          tutorId: project.tutorId,
        },
        { transaction },
      );

      const authorRecords = authorIds.map((userId) => ({
        projectId: created.id,
        userId,
      }));
      await this.projectAuthorModel.bulkCreate(authorRecords, { transaction });

      await transaction.commit();
      return this.toDomain(created);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async saveFiles(files: ProjectFile[]): Promise<ProjectFile[]> {
    const records = files.map((f) => ({
      id: f.id,
      projectId: f.projectId,
      fileName: f.fileName,
      urlPath: f.urlPath,
      fileType: f.fileType,
    }));
    const created = await this.projectFileModel.bulkCreate(records);
    return created.map(
      (c) =>
        new ProjectFile(
          c.id,
          c.projectId,
          c.fileName,
          c.urlPath,
          c.fileType as FileType,
        ),
    );
  }

  async delete(id: string): Promise<void> {
    await this.projectModel.destroy({ where: { id } });
  }
}
