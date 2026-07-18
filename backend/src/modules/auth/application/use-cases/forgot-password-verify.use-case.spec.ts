import { ForgotPasswordVerifyUseCase } from './forgot-password-verify.use-case';
import { UnauthorizedException } from '@nestjs/common';
import { IUserRepository } from '../../../users/domain/ports/IUserRepository';
import { IUserQuestionRepository } from '../../../security-questions/domain/ports/IUserQuestionRepository';
import { IHashService } from '../../domain/ports/IHashService';
import { IUserTokenRepository } from '../../domain/ports/IUserTokenRepository';

describe('ForgotPasswordVerifyUseCase', () => {
  let useCase: ForgotPasswordVerifyUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let userQuestionRepository: jest.Mocked<IUserQuestionRepository>;
  let hashService: jest.Mocked<IHashService>;
  let userTokenRepository: jest.Mocked<IUserTokenRepository>;

  const user = { id: 'user-uuid', email: 'a@b.com', dni: '123' } as any;
  const storedHash = 'stored-hash';
  const answers = [{ questionId: 'q-1', answer: '  Azul' }];

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
    hashService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };
    userTokenRepository = {
      create: jest.fn(),
      findByToken: jest.fn(),
      markUsed: jest.fn(),
    };

    useCase = new ForgotPasswordVerifyUseCase(
      userRepository,
      userQuestionRepository,
      hashService,
      userTokenRepository,
    );
  });

  it('creates a PASSWORD_RESET token and returns it on correct answers', async () => {
    userRepository.findByEmail.mockResolvedValue(user);
    userQuestionRepository.findByUserId.mockResolvedValue([
      {
        id: 'uq-1',
        userId: user.id,
        questionId: 'q-1',
        answerHash: storedHash,
      },
    ]);
    hashService.compare.mockResolvedValue(true);
    userTokenRepository.create.mockResolvedValue({} as any);

    const result = await useCase.execute({
      identifier: 'a@b.com',
      answers,
    });

    expect(typeof result.resetToken).toBe('string');
    expect(result.resetToken.length).toBeGreaterThan(0);
    expect(userTokenRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: user.id,
        type: 'PASSWORD_RESET',
      }),
    );
  });

  it('trims and lowercases answers before comparing', async () => {
    userRepository.findByEmail.mockResolvedValue(user);
    userQuestionRepository.findByUserId.mockResolvedValue([
      {
        id: 'uq-1',
        userId: user.id,
        questionId: 'q-1',
        answerHash: storedHash,
      },
    ]);
    hashService.compare.mockResolvedValue(true);

    await useCase.execute({ identifier: 'a@b.com', answers });

    expect(hashService.compare).toHaveBeenCalledWith('azul', storedHash);
  });

  it('throws UnauthorizedException when the user is not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByDni.mockResolvedValue(null);

    await expect(
      useCase.execute({ identifier: 'nope', answers }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when an answer is wrong', async () => {
    userRepository.findByEmail.mockResolvedValue(user);
    userQuestionRepository.findByUserId.mockResolvedValue([
      {
        id: 'uq-1',
        userId: user.id,
        questionId: 'q-1',
        answerHash: storedHash,
      },
    ]);
    hashService.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({ identifier: 'a@b.com', answers }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when answer count does not match', async () => {
    userRepository.findByEmail.mockResolvedValue(user);
    userQuestionRepository.findByUserId.mockResolvedValue([
      {
        id: 'uq-1',
        userId: user.id,
        questionId: 'q-1',
        answerHash: storedHash,
      },
    ]);

    await expect(
      useCase.execute({ identifier: 'a@b.com', answers: [] }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
