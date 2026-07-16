import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IActivityLogRepository } from '../../domain/ports/IActivityLogRepository';
import { ActivityLog } from '../../domain/entities/ActivityLog';

@Injectable()
export class ActivityLogService {
  constructor(
    @Inject('IActivityLogRepository')
    private readonly repository: IActivityLogRepository,
  ) {}

  async log(data: {
    userId: string;
    action: string;
    entityType: string;
    entityId?: string | null;
    description?: string | null;
    details?: Record<string, any> | null;
  }): Promise<void> {
    const log = new ActivityLog(
      randomUUID(),
      data.userId,
      data.action,
      data.entityType,
      data.entityId ?? null,
      data.description ?? null,
      data.details ?? null,
      new Date().toISOString(),
    );
    await this.repository.create(log);
  }

  async findAllPaginated(dto: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    return this.repository.findAllPaginated(dto);
  }
}
