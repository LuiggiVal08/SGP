import {
  ListUserSessionsUseCase,
  CloseUserSessionUseCase,
  CloseAllUserSessionsUseCase,
} from './session-use-cases';
import { ForbiddenException } from '@nestjs/common';
import { IUserSessionRepository } from '../../domain/ports/IUserSessionRepository';
import { UserSession } from '../../domain/entities/UserSession';

describe('ListUserSessionsUseCase', () => {
  let useCase: ListUserSessionsUseCase;
  let userSessionRepository: jest.Mocked<IUserSessionRepository>;

  const makeSession = (id: string) =>
    new UserSession(
      id,
      'uuid-1',
      new Date('2026-01-01T00:00:00Z'),
      true,
      'Chrome',
      '127.0.0.1',
    );

  beforeEach(() => {
    userSessionRepository = {
      create: jest.fn(),
      deactivate: jest.fn(),
      findActiveByUserId: jest.fn(),
    };
    useCase = new ListUserSessionsUseCase(userSessionRepository);
  });

  it('should return mapped active sessions', async () => {
    const sessions = [makeSession('s-1'), makeSession('s-2')];
    userSessionRepository.findActiveByUserId.mockResolvedValue(sessions);

    const result = await useCase.execute('uuid-1');

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 's-1',
      device: 'Chrome',
      ip: '127.0.0.1',
      startAt: new Date('2026-01-01T00:00:00Z'),
      active: true,
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userSessionRepository.findActiveByUserId).toHaveBeenCalledWith(
      'uuid-1',
    );
  });

  it('should return an empty array when there are no sessions', async () => {
    userSessionRepository.findActiveByUserId.mockResolvedValue([]);
    const result = await useCase.execute('uuid-1');
    expect(result).toEqual([]);
  });
});

describe('CloseUserSessionUseCase', () => {
  let useCase: CloseUserSessionUseCase;
  let userSessionRepository: jest.Mocked<IUserSessionRepository>;

  beforeEach(() => {
    userSessionRepository = {
      create: jest.fn(),
      deactivate: jest.fn(),
      findActiveByUserId: jest.fn(),
    };
    useCase = new CloseUserSessionUseCase(userSessionRepository);
  });

  it('should deactivate the session owned by the user', async () => {
    userSessionRepository.findActiveByUserId.mockResolvedValue([
      new UserSession('s-1', 'uuid-1', new Date(), true),
    ]);

    const result = await useCase.execute('uuid-1', 's-1');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userSessionRepository.deactivate).toHaveBeenCalledWith('s-1');
    expect(result.message).toBe('Sesión cerrada exitosamente');
  });

  it('should throw ForbiddenException when session does not belong to user', async () => {
    userSessionRepository.findActiveByUserId.mockResolvedValue([
      new UserSession('s-1', 'uuid-1', new Date(), true),
    ]);

    await expect(useCase.execute('uuid-1', 's-999')).rejects.toThrow(
      ForbiddenException,
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userSessionRepository.deactivate).not.toHaveBeenCalled();
  });
});

describe('CloseAllUserSessionsUseCase', () => {
  let useCase: CloseAllUserSessionsUseCase;
  let userSessionRepository: jest.Mocked<IUserSessionRepository>;

  beforeEach(() => {
    userSessionRepository = {
      create: jest.fn(),
      deactivate: jest.fn(),
      findActiveByUserId: jest.fn(),
    };
    useCase = new CloseAllUserSessionsUseCase(userSessionRepository);
  });

  it('should deactivate every active session of the user', async () => {
    userSessionRepository.findActiveByUserId.mockResolvedValue([
      new UserSession('s-1', 'uuid-1', new Date(), true),
      new UserSession('s-2', 'uuid-1', new Date(), true),
    ]);

    const result = await useCase.execute('uuid-1');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userSessionRepository.deactivate).toHaveBeenCalledTimes(2);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userSessionRepository.deactivate).toHaveBeenCalledWith('s-1');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userSessionRepository.deactivate).toHaveBeenCalledWith('s-2');
    expect(result.message).toBe(
      'Todas las sesiones fueron cerradas exitosamente',
    );
  });

  it('should not fail when there are no active sessions', async () => {
    userSessionRepository.findActiveByUserId.mockResolvedValue([]);
    const result = await useCase.execute('uuid-1');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userSessionRepository.deactivate).not.toHaveBeenCalled();
    expect(result.message).toBe(
      'Todas las sesiones fueron cerradas exitosamente',
    );
  });
});
