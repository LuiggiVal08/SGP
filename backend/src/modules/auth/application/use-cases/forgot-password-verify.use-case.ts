import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserQuestionRepository } from '../../../security-questions/domain/ports/IUserQuestionRepository';
import { IHashService } from '../../domain/ports/IHashService';

interface AnswerInput {
  questionId: string;
  answer: string;
}

export interface ForgotPasswordVerifyInput {
  resetToken: string;
  answers: AnswerInput[];
}

export interface ForgotPasswordVerifyOutput {
  verificationToken: string;
}

@Injectable()
export class ForgotPasswordVerifyUseCase {
  constructor(
    @Inject('IUserQuestionRepository')
    private readonly userQuestionRepository: IUserQuestionRepository,
    @Inject('IHashService')
    private readonly hashService: IHashService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    input: ForgotPasswordVerifyInput,
  ): Promise<ForgotPasswordVerifyOutput> {
    let payload: { sub: string; purpose: string };
    try {
      payload = this.jwtService.verify<{ sub: string; purpose: string }>(
        input.resetToken,
      );
    } catch {
      throw new UnauthorizedException(
        'Token inválido o expirado. Inicie el proceso nuevamente.',
      );
    }

    if (payload.purpose !== 'password-reset-init') {
      throw new UnauthorizedException('Token inválido');
    }

    const userQuestions = await this.userQuestionRepository.findByUserId(
      payload.sub,
    );
    const questionHashMap = new Map(
      userQuestions.map((uq) => [uq.questionId, uq.answerHash]),
    );

    if (input.answers.length !== userQuestions.length) {
      throw new UnauthorizedException('Respuestas incorrectas');
    }

    for (const answer of input.answers) {
      const storedHash = questionHashMap.get(answer.questionId);
      if (!storedHash) {
        throw new UnauthorizedException('Respuestas incorrectas');
      }
      const isMatch = await this.hashService.compare(
        answer.answer.trim().toLowerCase(),
        storedHash,
      );
      if (!isMatch) {
        throw new UnauthorizedException('Respuestas incorrectas');
      }
    }

    const verificationToken = this.jwtService.sign(
      { sub: payload.sub, purpose: 'password-reset-verify' },
      { expiresIn: '5m' },
    );

    return { verificationToken };
  }
}
