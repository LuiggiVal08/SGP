import { DeleteUserUseCase } from './delete-user.use-case';
import { IUserRepository } from '../../domain/ports/IUserRepository';
import { IRoleRepository } from '@modules/roles/domain/ports/IRoleRepository';
import { User } from '../../domain/entities/User';
import { Role } from '@modules/roles/domain/entities/Role';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let roleRepository: jest.Mocked<IRoleRepository>;

  const adminUser = new User(
    'u1',
    '12345678',
    'Juan',
    'Perez',
    'juan@test.com',
    'h',
    true,
    'pnf1',
    'inst1',
    'role-admin',
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
    roleRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
    };
    useCase = new DeleteUserUseCase(userRepository, roleRepository);
  });

  it('should delete a user when found', async () => {
    userRepository.findById.mockResolvedValue(adminUser);
    roleRepository.findById.mockResolvedValue(
      new Role('role-admin', 'PROFESOR', ''),
    );

    const result = await useCase.execute('u1', { sub: 'u2', role: 'IRCOP' });

    expect(result).toEqual({ message: 'Usuario eliminado exitosamente' });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userRepository.delete).toHaveBeenCalledWith('u1');
  });

  it('should throw NotFoundException when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('u1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should throw ForbiddenException when IRCOP tries to delete ADMIN', async () => {
    userRepository.findById.mockResolvedValue(adminUser);
    roleRepository.findById.mockResolvedValue(
      new Role('role-admin', 'ADMIN', ''),
    );

    await expect(
      useCase.execute('u1', { sub: 'u2', role: 'IRCOP' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userRepository.delete).not.toHaveBeenCalled();
  });
});
