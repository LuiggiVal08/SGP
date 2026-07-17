import { Injectable, Inject } from '@nestjs/common';
import { IPeriodRepository } from '../../domain/ports/IPeriodRepository';

@Injectable()
export class DeletePeriodUseCase {
  constructor(
    @Inject('IPeriodRepository')
    private readonly periodRepository: IPeriodRepository,
  ) {}

  async execute(id: string): Promise<void> {
    await this.periodRepository.delete(id);
  }
}
