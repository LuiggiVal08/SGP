import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  CreateUserSessionInput,
  IUserSessionRepository,
} from '../../../domain/ports/IUserSessionRepository';
import { UserSession } from '../../../domain/entities/UserSession';
import { UserSessionModel } from './models/user-session.model';

@Injectable()
export class UserSessionSequelizeAdapter implements IUserSessionRepository {
  constructor(
    @InjectModel(UserSessionModel)
    private readonly userSessionModel: typeof UserSessionModel,
  ) {}

  private toDomain(model: UserSessionModel): UserSession {
    return new UserSession(
      model.id,
      model.userId,
      model.startAt,
      model.active,
      model.device,
      model.ip,
      model.endAt,
    );
  }

  async create(input: CreateUserSessionInput): Promise<UserSession> {
    const session = await this.userSessionModel.create({
      userId: input.userId,
      device: input.device ?? null,
      ip: input.ip ?? null,
      startAt: new Date(),
      active: true,
    });
    return this.toDomain(session);
  }

  async deactivate(sessionId: string): Promise<void> {
    await this.userSessionModel.update(
      { active: false, endAt: new Date() },
      { where: { id: sessionId } },
    );
  }

  async findActiveByUserId(userId: string): Promise<UserSession[]> {
    const sessions = await this.userSessionModel.findAll({
      where: { userId, active: true },
    });
    return sessions.map((s) => this.toDomain(s));
  }
}
