import { ForgotPasswordInitUseCase } from './forgot-password-init.use-case';
import { IUserRepository } from '../../../users/domain/ports/IUserRepository';
import { IUserQuestionRepository } from '../../../security-questions/domain/ports/IUserQuestionRepository';
import { IQuestionRepository } from '../../../security-questions/domain/ports/IQuestionRepository';
import { UserQuestion } from '../../../security-questions/domain/entities/UserQuestion';
import { Question } from '../../../security-questions/domain/entities/Question';

describe('ForgotPasswordInitUseCase', () => {
  let useCase: ForgotPasswordInitUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let userQuestionRepository: jest.Mocked<IUserQuestionRepository>;
  let questionRepository: jest.Mocked<IQuestionRepository>;

  const user = { id: 'user-uuid', email: 'a@b.com', dni: '123' } as any;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findByDni: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;
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

    useCase = new ForgotPasswordInitUseCase(
      userRepository,
      userQuestionRepository,
      questionRepository,
    );
  });

  it('returns the user security questions without answers (happy path)', async () => {
    userRepository.findByEmail.mockResolvedValue(user);
    userQuestionRepository.findByUserId.mockResolvedValue([
      new UserQuestion('uq-1', user.id, 'q-1', 'hash1'),
    ]);
    questionRepository.findAll.mockResolvedValue([
      new Question('q-1', '¿Color favorito?', true),
    ]);

    const result = await useCase.execute({ identifier: 'a@b.com' });

    expect(result.questions).toEqual([
      { id: 'q-1', questionText: '¿Color favorito?' },
    ]);
    expect(JSON.stringify(result)).not.toContain('hash');
  });

  it('resolves the user by dni when email lookup fails', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByDni.mockResolvedValue(user);
    userQuestionRepository.findByUserId.mockResolvedValue([
      new UserQuestion('uq-1', user.id, 'q-1', 'hash1'),
    ]);
    questionRepository.findAll.mockResolvedValue([
      new Question('q-1', '¿Color favorito?', true),
    ]);

    const result = await useCase.execute({ identifier: '123' });

    expect(userRepository.findByDni).toHaveBeenCalledWith('123');
    expect(result.questions.length).toBe(1);
  });

  it('throws NotFoundException when the user does not exist', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByDni.mockResolvedValue(null);

    await expect(useCase.execute({ identifier: 'missing' })).rejects.toThrow(
      'No se encontró una cuenta con ese identificador',
    );
  });

  it('throws NotFoundException when the user has no security questions', async () => {
    userRepository.findByEmail.mockResolvedValue(user);
    userQuestionRepository.findByUserId.mockResolvedValue([]);

    await expect(useCase.execute({ identifier: 'a@b.com' })).rejects.toThrow(
      'Esta cuenta no tiene preguntas de seguridad configuradas',
    );
  });
});
