import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../../users/domain/ports/IUserRepository';
import { IUserQuestionRepository } from '../../../security-questions/domain/ports/IUserQuestionRepository';
import { IQuestionRepository } from '../../../security-questions/domain/ports/IQuestionRepository';

export interface ForgotPasswordInitInput {
  identifier: string;
}

export interface ForgotPasswordInitOutput {
  questions: Array<{ id: string; questionText: string }>;
}

@Injectable()
export class ForgotPasswordInitUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IUserQuestionRepository')
    private readonly userQuestionRepository: IUserQuestionRepository,
    @Inject('IQuestionRepository')
    private readonly questionRepository: IQuestionRepository,
  ) {}

  async execute(
    input: ForgotPasswordInitInput,
  ): Promise<ForgotPasswordInitOutput> {
    const user = await this.resolveUser(input.identifier);
    if (!user) {
      throw new NotFoundException(
        'No se encontró una cuenta con ese identificador',
      );
    }

    const userQuestions = await this.userQuestionRepository.findByUserId(
      user.id,
    );
    if (userQuestions.length === 0) {
      throw new NotFoundException(
        'Esta cuenta no tiene preguntas de seguridad configuradas',
      );
    }

    const allQuestions = await this.questionRepository.findAll();
    const questionMap = new Map(allQuestions.map((q) => [q.id, q]));

    const questions = userQuestions
      .map((uq) => questionMap.get(uq.questionId))
      .filter((q): q is NonNullable<typeof q> => q != null)
      .map((q) => ({ id: q.id, questionText: q.questionText }));

    return { questions };
  }

  private async resolveUser(identifier: string) {
    return (
      (await this.userRepository.findByEmail(identifier)) ??
      (await this.userRepository.findByDni(identifier))
    );
  }
}
