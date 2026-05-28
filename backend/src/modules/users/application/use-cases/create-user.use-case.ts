import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IUserRepository } from '../../domain/ports/IUserRepository';
import { IHashService } from '../../../auth/domain/ports/IHashService';
import { IRoleRepository } from '../../../roles/domain/ports/IRoleRepository';
import { User } from '../../domain/entities/User';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IHashService')
    private readonly hashService: IHashService,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(data: {
    dni: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roleName: string;
    careerId?: string;
    institutionId?: string;
  }) {
    const existingEmail = await this.userRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    const existingDni = await this.userRepository.findByDni(data.dni);
    if (existingDni) {
      throw new ConflictException('DNI already exists');
    }

    const role = await this.roleRepository.findByName(data.roleName);
    if (!role) {
      throw new NotFoundException(`Role "${data.roleName}" not found`);
    }

    const hashedPassword = await this.hashService.hash(data.password);

    const user = new User(
      randomUUID(),
      data.dni,
      data.firstName,
      data.lastName,
      data.email,
      hashedPassword,
      true,
      data.careerId ?? '',
      data.institutionId ?? '',
      role.id,
    );

    await this.userRepository.save(user);
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roleName: role.name,
    };
  }
}
