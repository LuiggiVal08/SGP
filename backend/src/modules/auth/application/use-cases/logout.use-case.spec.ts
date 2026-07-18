import { LogoutUseCase } from './logout.use-case';
import { ICacheService } from '@share/domain/ports/ICacheService';
import { ITokenService } from '../../domain/ports/ITokenService';
import { IUserSessionRepository } from '../../domain/ports/IUserSessionRepository';
import { UserSession } from '../../domain/entities/UserSession';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let cacheService: jest.Mocked<ICacheService>;
  let tokenService: jest.Mocked<ITokenService>;
  let userSessionRepository: jest.Mocked<IUserSessionRepository>;

  const mockSession = new UserSession(
    'session-uuid',
    'uuid-1',
    new Date(),
    true,
  );

  beforeEach(() => {
    cacheService = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
      delete: jest.fn(),
    };
    tokenService = {
      generate: jest.fn(),
      verify: jest.fn(),
      generateRefresh: jest.fn(),
      verifyRefresh: jest.fn(),
    };
    userSessionRepository = {
      create: jest.fn(),
      deactivate: jest.fn(),
      findActiveByUserId: jest.fn(),
    };

    useCase = new LogoutUseCase(
      cacheService,
      tokenService,
      userSessionRepository,
    );
  });

  it('should blacklist the refresh token in Redis', async () => {
    tokenService.verifyRefresh.mockReturnValue({
      sub: 'uuid-1',
      email: 'john@test.com',
      role: 'STUDENT',
    });
    userSessionRepository.findActiveByUserId.mockResolvedValue([]);

    await useCase.execute('refresh-token');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(cacheService.set).toHaveBeenCalledWith(
      'blacklist:refresh:refresh-token',
      '1',
      expect.any(Number),
    );
  });

  it('should deactivate active sessions of the user', async () => {
    tokenService.verifyRefresh.mockReturnValue({
      sub: 'uuid-1',
      email: 'john@test.com',
      role: 'STUDENT',
    });
    userSessionRepository.findActiveByUserId.mockResolvedValue([mockSession]);

    const result = await useCase.execute('refresh-token');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userSessionRepository.findActiveByUserId).toHaveBeenCalledWith(
      'uuid-1',
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userSessionRepository.deactivate).toHaveBeenCalledWith(
      'session-uuid',
    );
    expect(result.message).toBe('Sesión cerrada exitosamente');
  });

  it('should not throw when refresh token is invalid but still blacklist', async () => {
    tokenService.verifyRefresh.mockImplementation(() => {
      throw new Error('invalid');
    });

    await expect(useCase.execute('bad-token')).resolves.toEqual({
      message: 'Sesión cerrada exitosamente',
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(cacheService.set).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userSessionRepository.deactivate).not.toHaveBeenCalled();
  });
});
