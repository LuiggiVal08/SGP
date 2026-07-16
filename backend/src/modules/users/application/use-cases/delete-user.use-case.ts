import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IUserRepository } from '../../domain/ports/IUserRepository';
import { IRoleRepository } from '@modules/roles/domain/ports/IRoleRepository';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(
    id: string,
    currentUser?: { sub: string; role: string },
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const role = await this.roleRepository.findById(user.roleId);
    if (role?.name === 'ADMIN' && currentUser?.role === 'IRCOP') {
      throw new ForbiddenException('IRCOP no puede eliminar un usuario ADMIN');
    }

    await this.userRepository.delete(id);
    return { message: 'Usuario eliminado exitosamente' };
  }
}
