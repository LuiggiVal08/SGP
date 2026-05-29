import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IInstitutionRepository } from '../../domain/ports/IInstitutionRepository';
import { Institution } from '../../domain/entities/Institution';

@Injectable()
export class UpdateInstitutionUseCase {
  constructor(
    @Inject('IInstitutionRepository')
    private readonly institutionRepository: IInstitutionRepository,
  ) {}

  async execute(
    id: string,
    data: {
      name: string;
      acronym?: string;
      email?: string;
      contactInfo?: string;
    },
  ) {
    const existing = await this.institutionRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Institution not found');
    }
    const institution = new Institution(
      id,
      data.name,
      data.acronym ?? existing.acronym ?? '',
      data.email ?? existing.email ?? '',
      data.contactInfo ?? existing.contactInfo ?? '',
    );
    await this.institutionRepository.save(institution);
    return institution;
  }
}
