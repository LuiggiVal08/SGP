import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ICompletionCertificateRepository } from '../../domain/ports/ICompletionCertificateRepository';
import { CompletionCertificate } from '../../domain/entities/CompletionCertificate';
import { IUserRepository } from '@modules/users/domain/ports/IUserRepository';
import { CartaPdfService } from '@modules/projects/infrastructure/services/carta-pdf.service';
import { IFileStorageService } from '@share/domain/ports/IFileStorageService';

@Injectable()
export class GenerateCompletionCertificateUseCase {
  constructor(
    @Inject('ICompletionCertificateRepository')
    private readonly certificateRepository: ICompletionCertificateRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly cartaPdfService: CartaPdfService,
    @Inject('IFileStorageService')
    private readonly storageService: IFileStorageService,
  ) {}

  async execute(authorId: string) {
    const author = await this.userRepository.findById(authorId);
    if (!author) {
      throw new NotFoundException('Autor de proyecto no encontrado');
    }

    const existing = await this.certificateRepository.findByAuthor(authorId);
    if (existing) {
      return existing;
    }

    const authorName = `${author.firstName} ${author.lastName}`;

    const pdfBuffer = await this.cartaPdfService.generate({
      authorName,
      projectTitle: 'Trabajo Especial de Grado',
      tutorName: 'Coordinación de PNF',
      pnfName: 'PNF',
      year: new Date().getFullYear(),
      defensaDate: null,
    });

    const sanitizedName = authorName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const { url } = await this.storageService.upload(pdfBuffer, {
      originalName: `certificado-culminacion-${sanitizedName}.pdf`,
      mimeType: 'application/pdf',
      directory: `certificados/${authorId}`,
    });

    const code = this.generateCode();

    const certificate = new CompletionCertificate(
      randomUUID(),
      authorId,
      new Date(),
      url,
      code,
    );

    await this.certificateRepository.save(certificate);
    return certificate;
  }

  private generateCode(): string {
    const raw = randomUUID().replace(/-/g, '').toUpperCase();
    return `CERT-${raw.slice(0, 12)}`;
  }
}
