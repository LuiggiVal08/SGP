import { LoginUseCase } from './login-use-case';
import { IUserRepository } from '../../../users/domain/ports/IUserRepository';
import { IHashService } from '../../domain/ports/IHashService';
import { ITokenService } from '../../domain/ports/ITokenService';
import { IRoleRepository } from '../../../roles/domain/ports/IRoleRepository';
import { IUserSessionRepository } from '../../domain/ports/IUserSessionRepository';
import { User } from '../../../users/domain/entities/User';
import { Role } from '../../../roles/domain/entities/Role';
import { UserSession } from '../../domain/entities/UserSession';
import { UnauthorizedException } from '@nestjs/common';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let hashService: jest.Mocked<IHashService>;
  let tokenService: jest.Mocked<ITokenService>;
  let roleRepository: jest.Mocked<IRoleRepository>;
  let userSessionRepository: jest.Mocked<IUserSessionRepository>;

  const mockUser = new User(
    'uuid-1',
    '12345678',
    'John',
    'Doe',
    'john@test.com',
    'hashed-pwd',
    true,
    'career-uuid',
    'inst-uuid',
    'role-uuid',
  );

  const mockRole = new Role('role-uuid', 'STUDENT', 'Student role');
  const mockSession = new UserSession(
    'session-uuid',
    'uuid-1',
    new Date(),
    true,
  );

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByDni: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      findByRoleId: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      countByInstitutionId: jest.fn(),
      countByPnfId: jest.fn(),
      countByRoleName: jest.fn(),
      delete: jest.fn(),
    };
    hashService = { hash: jest.fn(), compare: jest.fn() };
    tokenService = {
      generate: jest.fn(),
      verify: jest.fn(),
      generateRefresh: jest.fn(),
      verifyRefresh: jest.fn(),
    };
    roleRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
    };
    userSessionRepository = {
      create: jest.fn().mockResolvedValue(mockSession),
      deactivate: jest.fn(),
      findActiveByUserId: jest.fn(),
    };

    useCase = new LoginUseCase(
      userRepository,
      hashService,
      tokenService,
      roleRepository,
      userSessionRepository,
    );
  });

  it('should return token and user on valid credentials', async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser);
    hashService.compare.mockResolvedValue(true);
    roleRepository.findById.mockResolvedValue(mockRole);
    tokenService.generate.mockReturnValue('jwt-token');

    const result = await useCase.execute({
      email: 'john@test.com',
      password: 'password123',
    });

    expect(result.accessToken).toBe('jwt-token');
    expect(result.user.email).toBe('john@test.com');
    expect(result.user.role).toBe('STUDENT');
  });

  it('should throw UnauthorizedException when email not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: 'unknown@test.com',
        password: 'password123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when password is invalid', async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser);
    hashService.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'john@test.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should look up by dni when identifier has no @', async () => {
    userRepository.findByDni.mockResolvedValue(mockUser);
    hashService.compare.mockResolvedValue(true);
    roleRepository.findById.mockResolvedValue(mockRole);
    tokenService.generate.mockReturnValue('jwt-token');
    tokenService.generateRefresh.mockReturnValue('refresh-token');

    const result = await useCase.execute({
      identifier: '12345678',
      password: 'password123',
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userRepository.findByDni).toHaveBeenCalledWith('12345678');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userRepository.findByEmail).not.toHaveBeenCalled();
    expect(result.user.id).toBe('uuid-1');
  });

  it('should return an accessToken and refreshToken pair', async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser);
    hashService.compare.mockResolvedValue(true);
    roleRepository.findById.mockResolvedValue(mockRole);
    tokenService.generate.mockReturnValue('jwt-token');
    tokenService.generateRefresh.mockReturnValue('refresh-token');

    const result = await useCase.execute({
      email: 'john@test.com',
      password: 'password123',
    });

    expect(result.accessToken).toBe('jwt-token');
    expect(result.refreshToken).toBe('refresh-token');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(tokenService.generateRefresh).toHaveBeenCalledWith({
      sub: 'uuid-1',
      email: 'john@test.com',
      role: 'STUDENT',
    });
  });

  it('should create a user session on successful login', async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser);
    hashService.compare.mockResolvedValue(true);
    roleRepository.findById.mockResolvedValue(mockRole);
    tokenService.generate.mockReturnValue('jwt-token');
    tokenService.generateRefresh.mockReturnValue('refresh-token');

    await useCase.execute({
      email: 'john@test.com',
      password: 'password123',
      device: 'chrome',
      ip: '127.0.0.1',
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userSessionRepository.create).toHaveBeenCalledWith({
      userId: 'uuid-1',
      device: 'chrome',
      ip: '127.0.0.1',
    });
  });
});
