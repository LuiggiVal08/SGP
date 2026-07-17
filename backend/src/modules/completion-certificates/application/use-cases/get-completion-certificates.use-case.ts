import { Injectable, Inject } from '@nestjs/common';
import { ICompletionCertificateRepository } from '../../domain/ports/ICompletionCertificateRepository';
import type { PaginationDto } from '@share/application/dtos/pagination.dto';

@Injectable()
export class GetCompletionCertificatesUseCase {
  constructor(
    @Inject('ICompletionCertificateRepository')
    private readonly certificateRepository: ICompletionCertificateRepository,
  ) {}

  async execute(dto: PaginationDto) {
    return this.certificateRepository.findAllPaginated(dto);
  }
}
