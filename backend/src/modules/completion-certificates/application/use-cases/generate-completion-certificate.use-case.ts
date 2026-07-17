import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ICompletionCertificateRepository } from '../../domain/ports/ICompletionCertificateRepository';
import { CompletionCertificate } from '../../domain/entities/CompletionCertificate';

@Injectable()
export class GenerateCompletionCertificateUseCase {
  constructor(
    @Inject('ICompletionCertificateRepository')
    private readonly repository: ICompletionCertificateRepository,
  ) {}

  async execute(authorId: string): Promise<CompletionCertificate> {
    const existing = await this.repository.findByAuthorId(authorId);
    if (existing) {
      throw new ConflictException('Certificate already exists for this author');
    }

    const serialNumber = this.generateCode();
    const pdfUrl = `/uploads/certificates/${serialNumber}.pdf`;

    return this.repository.create({
      authorId,
      pdfUrl,
      serialNumber,
    });
  }

  private generateCode(): string {
    const raw = randomUUID().replace(/-/g, '').toUpperCase();
    return `CERT-${raw.slice(0, 12)}`;
  }
}
