import { Injectable, Inject } from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';

export interface DashboardStats {
  total: number;
  byStatus: { status: string; count: number }[];
}

@Injectable()
export class GetDashboardStatsUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(): Promise<DashboardStats> {
    const projects = await this.projectRepository.findAll();
    const total = projects.length;

    const statusMap = new Map<string, number>();
    for (const p of projects) {
      statusMap.set(p.status, (statusMap.get(p.status) ?? 0) + 1);
    }
    const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
    }));

    return { total, byStatus };
  }
}
