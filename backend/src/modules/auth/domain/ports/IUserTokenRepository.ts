import { UserToken, UserTokenType } from '../entities/UserToken';

export interface CreateUserTokenInput {
  userId: string;
  token: string;
  type: UserTokenType;
  expiration: Date;
}

export const IUserTokenRepository = Symbol('IUserTokenRepository');

export interface IUserTokenRepository {
  create(input: CreateUserTokenInput): Promise<UserToken>;
  findByToken(token: string): Promise<UserToken | null>;
  markUsed(id: string): Promise<void>;
}
