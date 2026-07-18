import { ChangePasswordUseCase } from './change-password.use-case';
import { UnauthorizedException } from '@nestjs/common';
import { IUserRepository } from '../../../users/domain/ports/IUserRepository';
import { IHashService } from '../../domain/ports/IHashService';

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let hashService: jest.Mocked<IHashService>;

  const user = { id: 'user-uuid', password: 'current-hash' } as any;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;
    hashService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    useCase = new ChangePasswordUseCase(userRepository, hashService);
  });

  it('updates the password when the current password is valid', async () => {
    userRepository.findById.mockResolvedValue(user);
    hashService.compare.mockResolvedValue(true);
    hashService.hash.mockResolvedValue('new-hash');

    await useCase.execute({
      userId: 'user-uuid',
      currentPassword: 'current',
      newPassword: 'newPass1',
    });

    expect(hashService.compare).toHaveBeenCalledWith('current', 'current-hash');
    expect(hashService.hash).toHaveBeenCalledWith('newPass1');
    expect(userRepository.update).toHaveBeenCalledWith('user-uuid', {
      password: 'new-hash',
    });
  });

  it('throws UnauthorizedException when the user is not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'user-uuid',
        currentPassword: 'current',
        newPassword: 'newPass1',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when the current password is wrong', async () => {
    userRepository.findById.mockResolvedValue(user);
    hashService.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({
        userId: 'user-uuid',
        currentPassword: 'wrong',
        newPassword: 'newPass1',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
