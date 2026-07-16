import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import {
  ICompletionCertificateRepository,
  AuthorInfo,
} from '../../../domain/ports/ICompletionCertificateRepository';
import { CompletionCertificateModel } from './models/completion-certificate.model';
import { CompletionCertificate } from '../../../domain/entities/CompletionCertificate';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';
import { ProjectModel } from '@modules/projects/infrastructure/persistence/sequelize/models/project.model';
import { ProjectAuthorModel } from '@modules/projects/infrastructure/persistence/sequelize/models/project-author.model';
import { UserModel } from '@modules/users/infrastructure/persistence/sequelize/models/user.model';
import { CareerModel } from '@modules/careers/infrastructure/persistence/sequelize/models/career.model';

@Injectable()
export class CompletionCertificateSequelizeAdapter implements ICompletionCertificateRepository {
  constructor(
    @InjectModel(CompletionCertificateModel)
    private readonly model: typeof CompletionCertificateModel,
    @InjectModel(ProjectAuthorModel)
    private readonly projectAuthorModel: typeof ProjectAuthorModel,
  ) {}

  /* eslint-disable @typescript-eslint/no-unsafe-argument */
  private toDomain(model: CompletionCertificateModel): CompletionCertificate {
    return new CompletionCertificate(
      model.id,
      model.projectId,
      model.userId,
      model.pdfUrl,
      model.serialNumber,
      model.issuedAt,
      model.createdAt,
      model.updatedAt,
      /* eslint-enable @typescript-eslint/no-unsafe-argument */
      model.project
        ? {
            id: model.project.id,
            title: model.project.title,
            year: model.project.year,
            career: model.project.career
              ? { id: model.project.career.id, name: model.project.career.name }
              : undefined,
            tutor: model.project.tutor
              ? {
                  id: model.project.tutor.id,
                  firstName: model.project.tutor.firstName,
                  lastName: model.project.tutor.lastName,
                }
              : undefined,
          }
        : undefined,
      model.user
        ? {
            id: model.user.id,
            firstName: model.user.firstName,
            lastName: model.user.lastName,
            email: model.user.email,
          }
        : undefined,
    );
  }

  async create(data: {
    projectId: string;
    userId: string;
    pdfUrl: string;
    serialNumber: string;
  }): Promise<CompletionCertificate> {
    const created = await this.model.create({
      projectId: data.projectId,
      userId: data.userId,
      pdfUrl: data.pdfUrl,
      serialNumber: data.serialNumber,
      issuedAt: new Date(),
    });
    return this.toDomain(created);
  }

  async findById(id: string): Promise<CompletionCertificate | null> {
    const found = await this.model.findByPk(id, {
      include: [
        {
          model: ProjectModel,
          include: [
            { model: CareerModel, as: 'career' },
            { model: UserModel, as: 'tutor' },
          ],
        },
        UserModel,
      ],
    });
    return found ? this.toDomain(found) : null;
  }

  async findByUserId(userId: string): Promise<CompletionCertificate | null> {
    const found = await this.model.findOne({
      where: { userId },
      include: [
        {
          model: ProjectModel,
          include: [
            { model: CareerModel, as: 'career' },
            { model: UserModel, as: 'tutor' },
          ],
        },
        UserModel,
      ],
    });
    return found ? this.toDomain(found) : null;
  }

  async findAuthorInfo(userId: string): Promise<AuthorInfo | null> {
    const author = await this.projectAuthorModel.findOne({
      where: { userId },
      include: [
        {
          model: ProjectModel,
          include: [
            { model: CareerModel, as: 'career' },
            { model: UserModel, as: 'tutor' },
          ],
        },
      ],
    });

    if (!author) return null;

    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    const project = author.project ?? ((author as any).Project as ProjectModel);
    if (!project) return null;

    const student = await UserModel.findByPk(userId);
    if (!student) return null;

    const tutor = project.tutor;
    const career = project.career;
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */

    return {
      projectId: project.id,
      userId: student.id,
      projectTitle: project.title,
      projectYear: project.year,
      studentName: `${student.firstName} ${student.lastName}`,
      studentEmail: student.email,
      tutorName: tutor ? `${tutor.firstName} ${tutor.lastName}` : 'N/A',
      pnfName: career?.name ?? 'N/A',
    };
  }

  async findAllPaginated(
    dto: PaginationDto,
  ): Promise<PaginatedResult<CompletionCertificate>> {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 10, 100);

    const where: Record<string | symbol, any> = {};
    if (dto.search) {
      where.serialNumber = { [Op.like]: `%${dto.search}%` };
    }

    const { rows, count } = await this.model.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: ProjectModel,
          include: [
            { model: CareerModel, as: 'career' },
            { model: UserModel, as: 'tutor' },
          ],
        },
        UserModel,
      ],
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
}
