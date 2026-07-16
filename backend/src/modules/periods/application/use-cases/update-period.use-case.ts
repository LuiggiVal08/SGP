import { Injectable, Inject } from '@nestjs/common';
import { IPeriodRepository } from '../../domain/ports/IPeriodRepository';
import { Period } from '../../domain/entities/Period';

@Injectable()
export class UpdatePeriodUseCase {
  constructor(
    @Inject('IPeriodRepository')
    private readonly periodRepository: IPeriodRepository,
  ) {}

  async execute(
    id: string,
    data: {
      name?: string;
      startDate?: Date;
      endDate?: Date;
      isActive?: boolean;
    },
  ) {
    const existing = await this.periodRepository.findById(id);
    if (!existing) {
      throw new Error('PERIOD_NOT_FOUND');
    }
    const updated = new Period(
      existing.id,
      data.name ?? existing.name,
      data.startDate ?? existing.startDate,
      data.endDate ?? existing.endDate,
      data.isActive ?? existing.isActive,
    );
    await this.periodRepository.save(updated);
    return updated;
  }
}
