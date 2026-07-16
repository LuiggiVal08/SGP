import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ITrajectoryRepository } from '../../domain/ports/ITrajectoryRepository';
import { Trajectory } from '../../domain/entities/Trajectory';

@Injectable()
export class CreateTrajectoryUseCase {
  constructor(
    @Inject('ITrajectoryRepository')
    private readonly trajectoryRepository: ITrajectoryRepository,
  ) {}

  async execute(data: { pnfId: string; name: string; orderNumber: number }) {
    const trajectory = new Trajectory(
      randomUUID(),
      data.pnfId,
      data.name,
      data.orderNumber,
    );
    await this.trajectoryRepository.save(trajectory);
    return trajectory;
  }
}
