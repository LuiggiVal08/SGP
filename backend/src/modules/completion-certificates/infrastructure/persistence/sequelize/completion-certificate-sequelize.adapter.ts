import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ICompletionCertificateRepository } from '../../../domain/ports/ICompletionCertificateRepository';
import { CompletionCertificateModel } from './models/completion-certificate.model';
import { CompletionCertificate } from '../../../domain/entities/CompletionCertificate';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

@Injectable()
export class CompletionCertificateSequelizeAdapter implements ICompletionCertificateRepository {
  constructor(
    @InjectModel(CompletionCertificateModel)
    private readonly model: typeof CompletionCertificateModel,
  ) {}

  private toDomain(entity: CompletionCertificateModel): CompletionCertificate {
    return new CompletionCertificate(
      entity.id,
      entity.authorId,
      entity.pdfUrl,
      entity.serialNumber,
      entity.issuedAt,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  async create(data: {
    authorId: string;
    pdfUrl: string;
    serialNumber: string;
  }): Promise<CompletionCertificate> {
    const created = await this.model.create({
      authorId: data.authorId,
      pdfUrl: data.pdfUrl,
      serialNumber: data.serialNumber,
      issuedAt: new Date(),
    });
    return this.toDomain(created);
  }

  async findById(id: string): Promise<CompletionCertificate | null> {
    const found = await this.model.findByPk(id);
    return found ? this.toDomain(found) : null;
  }

  async findByAuthorId(
    authorId: string,
  ): Promise<CompletionCertificate | null> {
    const found = await this.model.findOne({ where: { authorId } });
    return found ? this.toDomain(found) : null;
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
