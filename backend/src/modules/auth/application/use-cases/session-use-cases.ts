import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { IUserSessionRepository } from '../../domain/ports/IUserSessionRepository';
import { UserSession } from '../../domain/entities/UserSession';

export interface UserSessionView {
  id: string;
  device: string | null | undefined;
  ip: string | null | undefined;
  startAt: Date;
  active: boolean;
}

@Injectable()
export class ListUserSessionsUseCase {
  constructor(
    @Inject('IUserSessionRepository')
    private readonly userSessionRepository: IUserSessionRepository,
  ) {}

  async execute(userId: string): Promise<UserSessionView[]> {
    const sessions =
      await this.userSessionRepository.findActiveByUserId(userId);
    return sessions.map(mapSessionToView);
  }
}

@Injectable()
export class CloseUserSessionUseCase {
  constructor(
    @Inject('IUserSessionRepository')
    private readonly userSessionRepository: IUserSessionRepository,
  ) {}

  async execute(
    userId: string,
    sessionId: string,
  ): Promise<{ message: string }> {
    const sessions =
      await this.userSessionRepository.findActiveByUserId(userId);
    const owns = sessions.some((session) => session.id === sessionId);
    if (!owns) {
      throw new ForbiddenException('La sesión no pertenece a este usuario');
    }
    await this.userSessionRepository.deactivate(sessionId);
    return { message: 'Sesión cerrada exitosamente' };
  }
}

@Injectable()
export class CloseAllUserSessionsUseCase {
  constructor(
    @Inject('IUserSessionRepository')
    private readonly userSessionRepository: IUserSessionRepository,
  ) {}

  async execute(userId: string): Promise<{ message: string }> {
    const sessions =
      await this.userSessionRepository.findActiveByUserId(userId);
    await Promise.all(
      sessions.map((session) =>
        this.userSessionRepository.deactivate(session.id),
      ),
    );
    return { message: 'Todas las sesiones fueron cerradas exitosamente' };
  }
}

function mapSessionToView(session: UserSession): UserSessionView {
  return {
    id: session.id,
    device: session.device,
    ip: session.ip,
    startAt: session.startAt,
    active: session.active,
  };
}
