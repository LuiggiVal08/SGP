import { Injectable, Inject } from '@nestjs/common';
import { ITrajectoryRepository } from '../../domain/ports/ITrajectoryRepository';
import { Trajectory } from '../../domain/entities/Trajectory';

@Injectable()
export class UpdateTrajectoryUseCase {
  constructor(
    @Inject('ITrajectoryRepository')
    private readonly trajectoryRepository: ITrajectoryRepository,
  ) {}

  async execute(
    id: string,
    data: { pnfId?: string; name?: string; orderNumber?: number },
  ) {
    const existing = await this.trajectoryRepository.findById(id);
    if (!existing) {
      throw new Error('TRAJECTORY_NOT_FOUND');
    }
    const updated = new Trajectory(
      existing.id,
      data.pnfId ?? existing.pnfId,
      data.name ?? existing.name,
      data.orderNumber ?? existing.orderNumber,
    );
    await this.trajectoryRepository.save(updated);
    return updated;
  }
}
