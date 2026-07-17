import { Injectable, Inject } from '@nestjs/common';
import { IUserQuestionRepository } from '../../domain/ports/IUserQuestionRepository';
import { IQuestionRepository } from '../../domain/ports/IQuestionRepository';

export interface UserQuestionResponse {
  id: string;
  questionId: string;
  questionText: string;
}

@Injectable()
export class GetUserQuestionsUseCase {
  constructor(
    @Inject('IUserQuestionRepository')
    private readonly userQuestionRepository: IUserQuestionRepository,
    @Inject('IQuestionRepository')
    private readonly questionRepository: IQuestionRepository,
  ) {}

  async execute(userId: string): Promise<UserQuestionResponse[]> {
    const userQuestions =
      await this.userQuestionRepository.findByUserId(userId);
    const questions = await this.questionRepository.findAll();
    const questionMap = new Map(questions.map((q) => [q.id, q.questionText]));

    return userQuestions.map((uq) => ({
      id: uq.id,
      questionId: uq.questionId,
      questionText: questionMap.get(uq.questionId) ?? 'Pregunta desconocida',
    }));
  }
}
