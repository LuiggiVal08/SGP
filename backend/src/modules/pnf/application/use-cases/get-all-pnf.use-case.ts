import { Injectable, Inject } from '@nestjs/common';
import { IPnfRepository } from '../../domain/ports/IPnfRepository';
import { ICacheService } from '@share/domain/ports/ICacheService';
import type { PaginationDto } from '@share/application/dtos/pagination.dto';

@Injectable()
export class GetAllPnfUseCase {
  constructor(
    @Inject('IPnfRepository')
    private readonly pnfRepository: IPnfRepository,
    @Inject('ICacheService')
    private readonly cacheService: ICacheService,
  ) {}

  async execute(dto?: PaginationDto, institutionId?: string): Promise<any> {
    if (
      dto &&
      (dto.page !== undefined ||
        dto.limit !== undefined ||
        dto.search !== undefined)
    ) {
      return this.pnfRepository.findAllPaginated(dto, institutionId);
    }

    if (institutionId) {
      return this.pnfRepository.findByInstitutionId(institutionId);
    }

    const cached = await this.cacheService.get('catalogs:pnf');
    if (cached) return JSON.parse(cached);

    const pnfs = await this.pnfRepository.findAll();
    await this.cacheService.set('catalogs:pnf', JSON.stringify(pnfs), 86400);
    return pnfs;
  }
}
