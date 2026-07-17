import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserRepository } from '../../../users/domain/ports/IUserRepository';
import { IUserQuestionRepository } from '../../../security-questions/domain/ports/IUserQuestionRepository';
import { IQuestionRepository } from '../../../security-questions/domain/ports/IQuestionRepository';

export interface ForgotPasswordInitInput {
  email: string;
}

export interface ForgotPasswordInitOutput {
  resetToken: string;
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
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    input: ForgotPasswordInitInput,
  ): Promise<ForgotPasswordInitOutput> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new NotFoundException('No se encontró una cuenta con ese email');
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

    const resetToken = this.jwtService.sign(
      { sub: user.id, purpose: 'password-reset-init' },
      { expiresIn: '5m' },
    );

    return { resetToken, questions };
  }
}
