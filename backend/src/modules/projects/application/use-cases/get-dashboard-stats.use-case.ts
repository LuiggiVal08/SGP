import { Injectable, Inject } from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { IUserRepository } from '@modules/users/domain/ports/IUserRepository';

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
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(): Promise<DashboardStats> {
    const [
      statusCounts,
      byYear,
      thisYear,
      tutorCount,
      studentCount,
      topTutors,
      recentActivity,
    ] = await Promise.all([
      this.projectRepository.countByStatus(),
      this.projectRepository.countByYear(),
      this.projectRepository.countThisYear(),
      this.userRepository.countByRoleName('DOCENTE'),
      this.userRepository.countByRoleName('STUDENT'),
      this.projectRepository.countByTutor(),
      this.projectRepository.findRecentActivity(10),
    ]);

    const total = statusCounts.reduce((sum, s) => sum + Number(s.count), 0);
    const completed = Number(
      statusCounts.find((s) => s.status === 'COMPLETED')?.count ?? 0,
    );
    const pendingValidation = Number(
      statusCounts.find((s) => s.status === 'PENDING_VALIDATION')?.count ?? 0,
    );
    const rejected = Number(
      statusCounts.find((s) => s.status === 'REJECTED')?.count ?? 0,
    );

    return {
      total,
      completed,
      pendingValidation,
      rejected,
      byYear,
      thisYear,
      tutorCount,
      studentCount,
      topTutors,
      recentActivity,
    };
  }
}
