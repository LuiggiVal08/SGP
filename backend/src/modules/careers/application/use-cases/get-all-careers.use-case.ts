import { Injectable, Inject } from '@nestjs/common';
import { ICareerRepository } from '../../domain/ports/ICareerRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';

@Injectable()
export class GetAllCareersUseCase {
  constructor(
    @Inject('ICareerRepository')
    private readonly careerRepository: ICareerRepository,
    @Inject('ICacheService')
    private readonly cacheService: ICacheService,
  ) {}

  async execute() {
    const cached = await this.cacheService.get('catalogs:careers');
    if (cached) return JSON.parse(cached);

    const careers = await this.careerRepository.findAll();
    await this.cacheService.set(
      'catalogs:careers',
      JSON.stringify(careers),
      86400,
    );
    return careers;
  }
}
