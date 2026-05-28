import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IInstitutionRepository } from '../../domain/ports/IInstitutionRepository';
import { Institution } from '../../domain/entities/Institution';

@Injectable()
export class CreateInstitutionUseCase {
  constructor(
    @Inject('IInstitutionRepository')
    private readonly institutionRepository: IInstitutionRepository,
  ) {}

  async execute(data: {
    name: string;
    acronym?: string;
    email?: string;
    contactInfo?: string;
  }) {
    const institution = new Institution(
      randomUUID(),
      data.name,
      data.acronym ?? '',
      data.email ?? '',
      data.contactInfo ?? '',
    );
    await this.institutionRepository.save(institution);
    return institution;
  }
}
