import { UpdateUserUseCase } from './update-user.use-case';
import { IUserRepository } from '../../domain/ports/IUserRepository';
import { User } from '../../domain/entities/User';
import { NotFoundException } from '@nestjs/common';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;

  const user = new User(
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
    useCase = new UpdateUserUseCase(userRepository);
  });

  it('should update the user when it exists', async () => {
    userRepository.findById.mockResolvedValue(user);
    const data = { firstName: 'Pedro', phone: '0412' };

    await useCase.execute('u1', data);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userRepository.update).toHaveBeenCalledWith('u1', data);
  });

  it('should throw NotFoundException when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('u1', { firstName: 'X' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
