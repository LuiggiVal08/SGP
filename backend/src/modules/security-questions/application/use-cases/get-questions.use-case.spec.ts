import { GetQuestionsUseCase } from './get-questions.use-case';
import { IQuestionRepository } from '../../domain/ports/IQuestionRepository';
import { Question } from '../../domain/entities/Question';

describe('GetQuestionsUseCase', () => {
  let useCase: GetQuestionsUseCase;
  let questionRepository: jest.Mocked<IQuestionRepository>;

  const questions = [
    new Question('q1', '¿Color favorito?', true),
    new Question('q2', '¿Nombre de tu mascota?', true),
  ];

  beforeEach(() => {
    questionRepository = {
      findAll: jest.fn(),
      findActive: jest.fn().mockResolvedValue(questions),
      findById: jest.fn(),
    };
    useCase = new GetQuestionsUseCase(questionRepository);
  });

  it('should return active questions', async () => {
    const result = await useCase.execute();

    expect(result).toEqual(questions);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(questionRepository.findActive).toHaveBeenCalled();
  });
});
