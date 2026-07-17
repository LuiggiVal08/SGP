import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ICompletionCertificateRepository } from '../../domain/ports/ICompletionCertificateRepository';

@Injectable()
export class GetByIdUseCase {
  constructor(
    @Inject('ICompletionCertificateRepository')
    private readonly certificateRepository: ICompletionCertificateRepository,
  ) {}

  async execute(id: string) {
    const certificate = await this.certificateRepository.findById(id);
    if (!certificate) {
      throw new NotFoundException('Certificado no encontrado');
    }
    return certificate;
  }
}
