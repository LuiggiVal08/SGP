import { Injectable, Inject } from '@nestjs/common';
import { IInstitutionRepository } from '../../domain/ports/IInstitutionRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';

@Injectable()
export class GetAllInstitutionsUseCase {
  constructor(
    @Inject('IInstitutionRepository')
    private readonly institutionRepository: IInstitutionRepository,
    @Inject('ICacheService')
    private readonly cacheService: ICacheService,
  ) {}

  async execute() {
    const cached = await this.cacheService.get('catalogs:institutions');
    if (cached) return JSON.parse(cached);

    const institutions = await this.institutionRepository.findAll();
    await this.cacheService.set(
      'catalogs:institutions',
      JSON.stringify(institutions),
      86400,
    );
    return institutions;
  }
}
