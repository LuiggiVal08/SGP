import { ToggleUserActiveUseCase } from './toggle-user-active.use-case';
import { IUserRepository } from '../../domain/ports/IUserRepository';
import { User } from '../../domain/entities/User';
import { NotFoundException } from '@nestjs/common';

describe('ToggleUserActiveUseCase', () => {
  let useCase: ToggleUserActiveUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  const activeUser = new User(
    'u1',
    '12345678',
    'Juan',
    'Perez',
    'juan@test.com',
    'h',
    true,
    'pnf1',
    'inst1',
    'r1',
  );
  const inactiveUser = new User(
    'u2',
    '87654321',
    'Ana',
    'Lopez',
    'ana@test.com',
    'h',
    false,
    'pnf1',
    'inst1',
    'r1',
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
    useCase = new ToggleUserActiveUseCase(userRepository);
  });

  it('should deactivate an active user', async () => {
    userRepository.findById.mockResolvedValue(activeUser);

    const result = await useCase.execute('u1');

    expect(result).toEqual({ isActive: false });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userRepository.update).toHaveBeenCalledWith('u1', {
      isActive: false,
    });
  });

  it('should activate an inactive user', async () => {
    userRepository.findById.mockResolvedValue(inactiveUser);

    const result = await useCase.execute('u2');

    expect(result).toEqual({ isActive: true });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userRepository.update).toHaveBeenCalledWith('u2', {
      isActive: true,
    });
  });

  it('should throw NotFoundException when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('u1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
