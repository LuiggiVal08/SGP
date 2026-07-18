import { UserSession } from '../entities/UserSession';

export interface CreateUserSessionInput {
  userId: string;
  device?: string | null;
  ip?: string | null;
}

export interface IUserSessionRepository {
  create(input: CreateUserSessionInput): Promise<UserSession>;
  deactivate(sessionId: string): Promise<void>;
  findActiveByUserId(userId: string): Promise<UserSession[]>;
}
