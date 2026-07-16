import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IPeriodRepository } from '../../domain/ports/IPeriodRepository';
import { Period } from '../../domain/entities/Period';

@Injectable()
export class CreatePeriodUseCase {
  constructor(
    @Inject('IPeriodRepository')
    private readonly periodRepository: IPeriodRepository,
  ) {}

  async execute(data: {
    name: string;
    startDate: Date;
    endDate: Date;
    isActive?: boolean;
  }) {
    const period = new Period(
      randomUUID(),
      data.name,
      data.startDate,
      data.endDate,
      data.isActive ?? true,
    );
    await this.periodRepository.save(period);
    return period;
  }
}
