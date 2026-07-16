import { Question } from '../entities/Question';

export const IQuestionRepository = Symbol('IQuestionRepository');

export interface IQuestionRepository {
  findAll(): Promise<Question[]>;
  findActive(): Promise<Question[]>;
  findById(id: string): Promise<Question | null>;
}
