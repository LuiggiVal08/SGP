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
    private readonly certificateModel: typeof CompletionCertificateModel,
  ) {}

  private toDomain(
    model: CompletionCertificateModel | null,
  ): CompletionCertificate | null {
    if (!model) return null;
    return new CompletionCertificate(
      model.id,
      model.authorId,
      model.issuedAt,
      model.pdfUrl,
      model.code,
    );
  }

  async save(certificate: CompletionCertificate): Promise<void> {
    await this.certificateModel.upsert({
      id: certificate.id,
      authorId: certificate.authorId,
      issuedAt: certificate.issuedAt,
      pdfUrl: certificate.pdfUrl,
      code: certificate.code,
    });
  }

  async findById(id: string): Promise<CompletionCertificate | null> {
    const cert = await this.certificateModel.findByPk(id);
    return this.toDomain(cert);
  }

  async findByAuthor(authorId: string): Promise<CompletionCertificate | null> {
    const cert = await this.certificateModel.findOne({
      where: { authorId },
    });
    return this.toDomain(cert);
  }

  async delete(id: string): Promise<void> {
    await this.certificateModel.destroy({ where: { id } });
  }

  async findAllPaginated(
    dto: PaginationDto,
  ): Promise<PaginatedResult<CompletionCertificate>> {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 10, 100);

    const where: Record<string | symbol, any> = {};
    if (dto.search) {
      where[Op.or] = [{ code: { [Op.like]: `%${dto.search}%` } }];
    }
    const { rows, count } = await this.certificateModel.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['issuedAt', 'DESC']],
    });
    return {
      data: rows.map(
        (r) =>
          new CompletionCertificate(
            r.id,
            r.authorId,
            r.issuedAt,
            r.pdfUrl,
            r.code,
          ),
      ),
      meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    };
  }
}
