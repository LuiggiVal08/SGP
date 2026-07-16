import { Injectable, Inject } from '@nestjs/common';
import { ITrajectoryRepository } from '../../domain/ports/ITrajectoryRepository';

@Injectable()
export class GetAllTrajectoriesUseCase {
  constructor(
    @Inject('ITrajectoryRepository')
    private readonly trajectoryRepository: ITrajectoryRepository,
  ) {}

  async execute(dto: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<any> {
    return this.trajectoryRepository.findAllPaginated(dto);
  }
}
