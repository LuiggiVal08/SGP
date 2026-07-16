import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { ICompletionCertificateRepository } from '../../domain/ports/ICompletionCertificateRepository';
import { CompletionCertificate } from '../../domain/entities/CompletionCertificate';
import type { PaginationDto } from '@share/application/dtos/pagination.dto';

@Injectable()
export class CompletionCertificateService {
  private readonly logger = new Logger(CompletionCertificateService.name);

  constructor(
    @Inject('ICompletionCertificateRepository')
    private readonly repository: ICompletionCertificateRepository,
  ) {}

  async generateByAuthorId(authorId: string): Promise<CompletionCertificate> {
    const authorInfo = await this.repository.findAuthorInfo(authorId);
    if (!authorInfo) {
      throw new NotFoundException(
        'Author not found or not linked to any project',
      );
    }

    const existing = await this.repository.findByUserId(authorId);
    if (existing) {
      throw new ConflictException('Certificate already exists for this user');
    }

    const serialNumber = this.generateSerialNumber(authorInfo.projectYear);
    const pdfUrl = `/uploads/certificates/${serialNumber}.pdf`;

    this.logger.log(
      `Generating certificate for user ${authorId} — project "${authorInfo.projectTitle}"`,
    );

    return this.repository.create({
      projectId: authorInfo.projectId,
      userId: authorId,
      pdfUrl,
      serialNumber,
    });
  }

  async findAllPaginated(dto: PaginationDto) {
    return this.repository.findAllPaginated(dto);
  }

  async findById(id: string): Promise<CompletionCertificate> {
    const cert = await this.repository.findById(id);
    if (!cert) {
      throw new NotFoundException('Certificate not found');
    }
    return cert;
  }

  private generateSerialNumber(year: number): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `CERT-${year}-${timestamp}-${random}`;
  }
}
