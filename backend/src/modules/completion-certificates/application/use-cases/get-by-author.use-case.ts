import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ICompletionCertificateRepository } from '../../domain/ports/ICompletionCertificateRepository';

@Injectable()
export class GetByAuthorUseCase {
  constructor(
    @Inject('ICompletionCertificateRepository')
    private readonly certificateRepository: ICompletionCertificateRepository,
  ) {}

  async execute(authorId: string) {
    const certificate = await this.certificateRepository.findByAuthor(authorId);
    if (!certificate) {
      throw new NotFoundException('Certificado no encontrado para el autor');
    }
    return certificate;
  }
}
