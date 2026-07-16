import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { IProjectRepository } from '../../../domain/ports/IProjectRepository';
import { Project, ProjectStatus } from '../../../domain/entities/Project';
import { ProjectFile, FileType } from '../../../domain/entities/ProjectFile';
import { ProjectModel } from './models/project.model';
import { ProjectFileModel } from './models/project-file.model';
import { ProjectAuthorModel } from './models/project-author.model';

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
      model.description,
      model.problemStatement,
      model.subjectAssignmentId,
      model.locationId,
      model.communityTutorId,
      model.status as ProjectStatus,
      model.cdSubmitted,
    );
  }

  async findById(id: string): Promise<Project | null> {
    const project = await this.projectModel.findByPk(id, {
      include: [ProjectFileModel],
    });
    return project ? this.toDomain(project) : null;
  }

  async findAll(): Promise<Project[]> {
    const projects = await this.projectModel.findAll({
      include: [ProjectFileModel],
    });
    return projects.map((p) => this.toDomain(p));
  }

  async findByStatus(status: ProjectStatus): Promise<Project[]> {
    const projects = await this.projectModel.findAll({ where: { status } });
    return projects.map((p) => this.toDomain(p));
  }

  async save(project: Project, authorIds: string[]): Promise<Project> {
    const transaction = await this.sequelize.transaction();
    try {
      const [created] = await this.projectModel.upsert(
        {
          id: project.id,
          title: project.title,
          description: project.description,
          problemStatement: project.problemStatement,
          subjectAssignmentId: project.subjectAssignmentId,
          locationId: project.locationId,
          communityTutorId: project.communityTutorId,
          status: project.status,
          cdSubmitted: project.cdSubmitted,
        },
        { transaction },
      );

      const authorRecords = authorIds.map((professorId) => ({
        projectId: created.id,
        professorId,
      }));
      await this.projectAuthorModel.bulkCreate(authorRecords, {
        transaction,
      });

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

  async update(id: string, data: Record<string, unknown>): Promise<Project> {
    await this.projectModel.update(data, { where: { id } });
    const updated = await this.projectModel.findByPk(id);
    if (!updated) throw new Error('Project not found after update');
    return this.toDomain(updated);
  }

  async findFileById(id: string): Promise<ProjectFile | null> {
    const file = await this.projectFileModel.findByPk(id);
    return file
      ? new ProjectFile(
          file.id,
          file.projectId,
          file.fileName,
          file.urlPath,
          file.fileType as FileType,
          file.documentType ?? null,
        )
      : null;
  }
}
