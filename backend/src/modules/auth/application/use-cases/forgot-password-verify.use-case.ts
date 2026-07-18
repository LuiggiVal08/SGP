import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { IUserQuestionRepository } from '../../../security-questions/domain/ports/IUserQuestionRepository';
import { IHashService } from '../../domain/ports/IHashService';
import { IUserTokenRepository } from '../../domain/ports/IUserTokenRepository';
import { IUserRepository } from '../../../users/domain/ports/IUserRepository';

interface AnswerInput {
  questionId: string;
  answer: string;
}

export interface ForgotPasswordVerifyInput {
  identifier: string;
  answers: AnswerInput[];
}

export interface ForgotPasswordVerifyOutput {
  resetToken: string;
}

const PASSWORD_RESET_TTL_MINUTES = 15;

@Injectable()
export class ForgotPasswordVerifyUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IUserQuestionRepository')
    private readonly userQuestionRepository: IUserQuestionRepository,
    @Inject('IHashService')
    private readonly hashService: IHashService,
    @Inject('IUserTokenRepository')
    private readonly userTokenRepository: IUserTokenRepository,
  ) {}

  async execute(
    input: ForgotPasswordVerifyInput,
  ): Promise<ForgotPasswordVerifyOutput> {
    const user =
      (await this.userRepository.findByEmail(input.identifier)) ??
      (await this.userRepository.findByDni(input.identifier));
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const userQuestions = await this.userQuestionRepository.findByUserId(
      user.id,
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

    const token = randomBytes(32).toString('hex');
    const expiration = new Date(
      Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000,
    );

    await this.userTokenRepository.create({
      userId: user.id,
      token,
      type: 'PASSWORD_RESET',
      expiration,
    });

    return { resetToken: token };
  }
}
