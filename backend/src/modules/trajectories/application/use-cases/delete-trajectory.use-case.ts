import { Injectable, Inject } from '@nestjs/common';
import { ITrajectoryRepository } from '../../domain/ports/ITrajectoryRepository';

@Injectable()
export class DeleteTrajectoryUseCase {
  constructor(
    @Inject('ITrajectoryRepository')
    private readonly trajectoryRepository: ITrajectoryRepository,
  ) {}

  async execute(id: string): Promise<void> {
    await this.trajectoryRepository.delete(id);
  }
}
