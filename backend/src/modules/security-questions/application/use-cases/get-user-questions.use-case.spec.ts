import { GetUserQuestionsUseCase } from './get-user-questions.use-case';
import { IUserQuestionRepository } from '../../domain/ports/IUserQuestionRepository';
import { IQuestionRepository } from '../../domain/ports/IQuestionRepository';
import { UserQuestion } from '../../domain/entities/UserQuestion';
import { Question } from '../../domain/entities/Question';

describe('GetUserQuestionsUseCase', () => {
  let useCase: GetUserQuestionsUseCase;
  let userQuestionRepository: jest.Mocked<IUserQuestionRepository>;
  let questionRepository: jest.Mocked<IQuestionRepository>;

  beforeEach(() => {
    userQuestionRepository = {
      findByUserId: jest.fn(),
      save: jest.fn(),
      deleteByUserId: jest.fn(),
    };
    questionRepository = {
      findAll: jest.fn(),
      findActive: jest.fn(),
      findById: jest.fn(),
    };
    useCase = new GetUserQuestionsUseCase(
      userQuestionRepository,
      questionRepository,
    );
  });

  it('should return user questions with resolved text', async () => {
    userQuestionRepository.findByUserId.mockResolvedValue([
      new UserQuestion('uq1', 'u1', 'q1', 'hash'),
    ]);
    questionRepository.findAll.mockResolvedValue([
      new Question('q1', '¿Color favorito?', true),
      new Question('q2', '¿Mascota?', true),
    ]);

    const result = await useCase.execute('u1');

    expect(result).toEqual([
      { id: 'uq1', questionId: 'q1', questionText: '¿Color favorito?' },
    ]);
  });

  it('should return unknown text when question is missing', async () => {
    userQuestionRepository.findByUserId.mockResolvedValue([
      new UserQuestion('uq1', 'u1', 'missing', 'hash'),
    ]);
    questionRepository.findAll.mockResolvedValue([
      new Question('q1', '¿Color favorito?', true),
    ]);

    const result = await useCase.execute('u1');

    expect(result[0].questionText).toBe('Pregunta desconocida');
  });
});
