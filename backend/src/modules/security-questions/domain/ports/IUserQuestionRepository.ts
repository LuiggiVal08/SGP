import { UserQuestion } from '../entities/UserQuestion';

export const IUserQuestionRepository = Symbol('IUserQuestionRepository');

export interface IUserQuestionRepository {
  findByUserId(userId: string): Promise<UserQuestion[]>;
  save(userQuestion: UserQuestion): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}
