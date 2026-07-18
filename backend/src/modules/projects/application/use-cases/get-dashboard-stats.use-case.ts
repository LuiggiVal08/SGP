import { Injectable, Inject } from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';

export interface DashboardStats {
  total: number;
  completed: number;
  pendingValidation: number;
  rejected: number;
  byYear: { year: number; count: number }[];
  thisYear: number;
  tutorCount: number;
  studentCount: number;
  topTutors: {
    tutorId: string;
    firstName: string;
    lastName: string;
    projectCount: number;
  }[];
  recentActivity: {
    id: string;
    title: string;
    status: string;
    updatedAt: Date;
  }[];
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

    const thisYear = await this.projectRepository.countThisYear();

    const recentActivity =
      await this.projectRepository.findRecentActivityWithTimestamps();

    return {
      total,
      completed: statusMap.get('APROBADO') ?? 0,
      pendingValidation: statusMap.get('ENTREGADO') ?? 0,
      rejected: statusMap.get('RECHAZADO') ?? 0,
      byYear: [],
      thisYear,
      tutorCount: 0,
      studentCount: 0,
      topTutors: [],
      recentActivity,
    };
  }
}
