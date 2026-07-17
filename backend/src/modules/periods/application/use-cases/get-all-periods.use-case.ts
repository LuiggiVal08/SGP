import { Injectable, Inject } from '@nestjs/common';
import { IPeriodRepository } from '../../domain/ports/IPeriodRepository';

@Injectable()
export class GetAllPeriodsUseCase {
  constructor(
    @Inject('IPeriodRepository')
    private readonly periodRepository: IPeriodRepository,
  ) {}

  async execute(dto: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<any> {
    return this.periodRepository.findAllPaginated(dto);
  }
}
