import { SetUserQuestionsUseCase } from './set-user-questions.use-case';
import { IUserQuestionRepository } from '../../domain/ports/IUserQuestionRepository';
import { IQuestionRepository } from '../../domain/ports/IQuestionRepository';
import { IHashService } from '@modules/auth/domain/ports/IHashService';
import { Question } from '../../domain/entities/Question';
import { BadRequestException } from '@nestjs/common';

describe('SetUserQuestionsUseCase', () => {
  let useCase: SetUserQuestionsUseCase;
  let userQuestionRepository: jest.Mocked<IUserQuestionRepository>;
  let questionRepository: jest.Mocked<IQuestionRepository>;
  let hashService: jest.Mocked<IHashService>;

  const active = [
    new Question('q1', '¿Color favorito?', true),
    new Question('q2', '¿Mascota?', true),
    new Question('q3', '¿Ciudad?', true),
  ];

  beforeEach(() => {
    userQuestionRepository = {
      findByUserId: jest.fn(),
      save: jest.fn(),
      deleteByUserId: jest.fn(),
    };
    questionRepository = {
      findAll: jest.fn(),
      findActive: jest.fn().mockResolvedValue(active),
      findById: jest.fn(),
    };
    hashService = {
      hash: jest.fn().mockResolvedValue('hashed'),
      compare: jest.fn(),
    };
    useCase = new SetUserQuestionsUseCase(
      userQuestionRepository,
      questionRepository,
      hashService,
    );
  });

  it('should save three valid distinct questions', async () => {
    const questions = [
      { questionId: 'q1', answer: 'Rojo' },
      { questionId: 'q2', answer: 'Fido' },
      { questionId: 'q3', answer: 'Caracas' },
    ];

    await useCase.execute('u1', questions);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userQuestionRepository.deleteByUserId).toHaveBeenCalledWith('u1');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userQuestionRepository.save).toHaveBeenCalledTimes(3);
    const saved = userQuestionRepository.save.mock.calls[0][0];
    expect(saved.answerHash).toBe('hashed');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(hashService.hash).toHaveBeenCalledWith('rojo');
  });

  it('should throw BadRequestException when not exactly 3 questions', async () => {
    await expect(
      useCase.execute('u1', [{ questionId: 'q1', answer: 'x' }]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should throw BadRequestException when a question is not active', async () => {
    const questions = [
      { questionId: 'q1', answer: 'Rojo' },
      { questionId: 'q2', answer: 'Fido' },
      { questionId: 'inactive', answer: 'x' },
    ];

    await expect(useCase.execute('u1', questions)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('should throw BadRequestException when questions are not distinct', async () => {
    const questions = [
      { questionId: 'q1', answer: 'Rojo' },
      { questionId: 'q1', answer: 'Fido' },
      { questionId: 'q2', answer: 'Caracas' },
    ];

    await expect(useCase.execute('u1', questions)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
