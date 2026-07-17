import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IUserQuestionRepository } from '../../domain/ports/IUserQuestionRepository';
import { IQuestionRepository } from '../../domain/ports/IQuestionRepository';
import { UserQuestion } from '../../domain/entities/UserQuestion';
import { IHashService } from '../../../auth/domain/ports/IHashService';

interface QuestionInput {
  questionId: string;
  answer: string;
}

@Injectable()
export class SetUserQuestionsUseCase {
  constructor(
    @Inject('IUserQuestionRepository')
    private readonly userQuestionRepository: IUserQuestionRepository,
    @Inject('IQuestionRepository')
    private readonly questionRepository: IQuestionRepository,
    @Inject('IHashService')
    private readonly hashService: IHashService,
  ) {}

  async execute(userId: string, questions: QuestionInput[]): Promise<void> {
    if (questions.length !== 3) {
      throw new BadRequestException(
        'Debe proporcionar exactamente 3 preguntas',
      );
    }

    const activeQuestions = await this.questionRepository.findActive();
    const activeIds = new Set(activeQuestions.map((q) => q.id));

    for (const q of questions) {
      if (!activeIds.has(q.questionId)) {
        throw new BadRequestException(
          `La pregunta ${q.questionId} no es válida`,
        );
      }
    }

    const uniqueIds = new Set(questions.map((q) => q.questionId));
    if (uniqueIds.size !== 3) {
      throw new BadRequestException('Las preguntas deben ser distintas');
    }

    await this.userQuestionRepository.deleteByUserId(userId);

    for (const q of questions) {
      const answerHash = await this.hashService.hash(
        q.answer.trim().toLowerCase(),
      );
      const userQuestion = new UserQuestion(
        randomUUID(),
        userId,
        q.questionId,
        answerHash,
      );
      await this.userQuestionRepository.save(userQuestion);
    }
  }
}
