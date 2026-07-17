import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { IProjectRepository } from '../../../domain/ports/IProjectRepository';
import {
  Project,
  ProjectStatus,
  ProjectMilestone,
  MilestoneStatus,
  MilestoneType,
  ProjectRevision,
  DefensaResultData,
  CommunityTutorData,
  CartaCulminacionData,
} from '../../../domain/entities/Project';
import {
  ProjectFile,
  DocumentType,
} from '../../../domain/entities/ProjectFile';
import { ProjectModel } from './models/project.model';
import { ProjectFileModel } from './models/project-file.model';
import { ProjectAuthorModel } from './models/project-author.model';
import { ProjectMilestoneModel } from './models/project-milestone.model';
import { ProjectRevisionModel } from './models/project-revision.model';
import { Op } from 'sequelize';

@Injectable()
export class ProjectSequelizeAdapter implements IProjectRepository {
  constructor(
    @InjectModel(ProjectModel)
    private readonly projectModel: typeof ProjectModel,
    @InjectModel(ProjectFileModel)
    private readonly projectFileModel: typeof ProjectFileModel,
    @InjectModel(ProjectAuthorModel)
    private readonly projectAuthorModel: typeof ProjectAuthorModel,
    @InjectModel(ProjectMilestoneModel)
    private readonly milestoneModel: typeof ProjectMilestoneModel,
    @InjectModel(ProjectRevisionModel)
    private readonly revisionModel: typeof ProjectRevisionModel,
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

  private milestoneToDomain(model: ProjectMilestoneModel): ProjectMilestone {
    return new ProjectMilestone(
      model.id,
      model.projectId,
      model.type,
      model.stage,
      model.status,
      model.dueDate,
      model.submittedAt,
      model.reviewedAt,
      model.approvedBy,
      model.approvedAt,
    );
  }

  private revisionToDomain(model: ProjectRevisionModel): ProjectRevision {
    return new ProjectRevision(
      model.id,
      model.milestoneId,
      model.revisedBy,
      model.comment,
      model.statusBefore,
      model.statusAfter,
    );
  }

  private fileToDomain(model: ProjectFileModel): ProjectFile {
    return new ProjectFile(
      model.id,
      model.projectId,
      model.fileName,
      model.urlPath,
      model.documentType as DocumentType,
      model.uploadedBy ?? '',
      model.version,
      model.mimeType,
      model.size,
    );
  }

  async findById(id: string): Promise<Project | null> {
    const project = await this.projectModel.findByPk(id);
    return project ? this.toDomain(project) : null;
  }

  async findAll(): Promise<Project[]> {
    const projects = await this.projectModel.findAll();
    return projects.map((p) => this.toDomain(p));
  }

  async findByStatus(status: ProjectStatus): Promise<Project[]> {
    const projects = await this.projectModel.findAll({ where: { status } });
    return projects.map((p) => this.toDomain(p));
  }

  async findBySubjectAssignment(
    subjectAssignmentId: string,
  ): Promise<Project[]> {
    const projects = await this.projectModel.findAll({
      where: { subjectAssignmentId },
    });
    return projects.map((p) => this.toDomain(p));
  }

  async findByLocation(locationId: string): Promise<Project[]> {
    const projects = await this.projectModel.findAll({ where: { locationId } });
    return projects.map((p) => this.toDomain(p));
  }

  async findByCommunityTutor(communityTutorId: string): Promise<Project[]> {
    const projects = await this.projectModel.findAll({
      where: { communityTutorId },
    });
    return projects.map((p) => this.toDomain(p));
  }

  async findByStudent(studentId: string): Promise<Project[]> {
    const authorRecords = await this.projectAuthorModel.findAll({
      where: { studentId },
    });
    const projectIds = authorRecords.map((a) => a.projectId);
    if (projectIds.length === 0) return [];
    const projects = await this.projectModel.findAll({
      where: { id: projectIds },
    });
    return projects.map((p) => this.toDomain(p));
  }

  async save(project: Project, studentIds: string[]): Promise<Project> {
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

      const authorRecords = studentIds.map((studentId) => ({
        projectId: created.id,
        studentId,
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

  async delete(id: string): Promise<void> {
    await this.projectModel.destroy({ where: { id } });
  }

  async update(
    id: string,
    data: Partial<
      Pick<
        Project,
        'title' | 'description' | 'problemStatement' | 'status' | 'cdSubmitted'
      >
    >,
  ): Promise<Project> {
    await this.projectModel.update(data, {
      where: { id },
    });
    const model = await this.projectModel.findByPk(id);
    return this.toDomain(model!);
  }

  async findAllPaginated(params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{
    data: Project[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const { page, limit, search } = params;
    const where: Record<string, unknown> = {};
    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }
    const { rows, count } = await this.projectModel.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
    });
    return {
      data: rows.map((r) => this.toDomain(r)),
      meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    };
  }

  async countFiles(projectId: string): Promise<number> {
    return this.projectFileModel.count({ where: { projectId } });
  }

  async countByStatus(status: ProjectStatus): Promise<number> {
    return this.projectModel.count({ where: { status } });
  }

  async countByYear(_year: number): Promise<number> {
    return this.projectModel.count();
  }

  async countThisYear(): Promise<number> {
    return this.projectModel.count();
  }

  async findRecentActivity(): Promise<Project[]> {
    const projects = await this.projectModel.findAll({
      order: [['updatedAt', 'DESC']],
      limit: 10,
    });
    return projects.map((p) => this.toDomain(p));
  }

  async saveFiles(files: ProjectFile[]): Promise<ProjectFile[]> {
    const records = files.map((f) => ({
      id: f.id,
      projectId: f.projectId,
      fileName: f.fileName,
      urlPath: f.urlPath,
      documentType: f.documentType,
      uploadedBy: f.uploadedBy,
      version: f.version,
      mimeType: f.mimeType,
      size: f.size,
    }));
    const created = await this.projectFileModel.bulkCreate(records);
    return created.map((c) => this.fileToDomain(c));
  }

  async findFileById(id: string): Promise<ProjectFile | null> {
    const model = await this.projectFileModel.findByPk(id);
    return model ? this.fileToDomain(model) : null;
  }

  async findFilesByProjectId(projectId: string): Promise<ProjectFile[]> {
    const models = await this.projectFileModel.findAll({
      where: { projectId },
      order: [['version', 'DESC']],
    });
    return models.map((m) => this.fileToDomain(m));
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.projectFileModel.destroy({ where: { id: fileId } });
  }

  async getMaxVersion(
    projectId: string,
    documentType: string,
  ): Promise<number> {
    const max = await this.projectFileModel.max('version', {
      where: { projectId, documentType },
    });
    return (max as number) || 0;
  }

  async findMilestonesByProject(
    projectId: string,
  ): Promise<ProjectMilestone[]> {
    const models = await this.milestoneModel.findAll({
      where: { projectId },
      order: [['stage', 'ASC']],
    });
    return models.map((m) => this.milestoneToDomain(m));
  }

  async findMilestoneById(
    milestoneId: string,
  ): Promise<ProjectMilestone | null> {
    const model = await this.milestoneModel.findByPk(milestoneId);
    return model ? this.milestoneToDomain(model) : null;
  }

  async createMilestone(
    projectId: string,
    type: string,
    stage?: number,
    dueDate?: Date,
  ): Promise<ProjectMilestone> {
    const model = await this.milestoneModel.create({
      projectId,
      type: type as MilestoneType,
      stage: stage ?? null,
      status: 'PENDIENTE',
      dueDate: dueDate ?? null,
    });
    return this.milestoneToDomain(model);
  }

  async updateMilestoneStatus(
    milestoneId: string,
    status: MilestoneStatus,
    userId: string,
  ): Promise<ProjectMilestone> {
    const now = new Date();
    const updateData: Record<string, unknown> = { status };
    if (status === 'APROBADO') {
      updateData.approvedBy = userId;
      updateData.approvedAt = now;
    }
    if (status === 'EN_REVISION') {
      updateData.reviewedAt = now;
    }
    await this.milestoneModel.update(updateData, {
      where: { id: milestoneId },
    });
    const model = await this.milestoneModel.findByPk(milestoneId);
    return this.milestoneToDomain(model!);
  }

  async findRevisionsByMilestone(
    milestoneId: string,
  ): Promise<ProjectRevision[]> {
    const models = await this.revisionModel.findAll({ where: { milestoneId } });
    return models.map((m) => this.revisionToDomain(m));
  }

  async createRevision(revision: ProjectRevision): Promise<ProjectRevision> {
    const created = await this.revisionModel.create({
      id: revision.id,
      milestoneId: revision.milestoneId,
      revisedBy: revision.revisedBy,
      comment: revision.comment,
      statusBefore: revision.statusBefore,
      statusAfter: revision.statusAfter,
    });
    return this.revisionToDomain(created);
  }

  async findDefensaByProject(
    _projectId: string,
  ): Promise<DefensaResultData | null> {
    return null;
  }

  async saveDefensa(data: DefensaResultData): Promise<DefensaResultData> {
    return data;
  }

  async findCartasByProject(
    _projectId: string,
  ): Promise<CartaCulminacionData[]> {
    return [];
  }

  async createCarta(data: CartaCulminacionData): Promise<CartaCulminacionData> {
    return data;
  }

  async deleteCartasByProject(_projectId: string): Promise<void> {
    // stub
  }
}
