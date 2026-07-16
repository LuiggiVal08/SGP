import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IUserRepository } from '@modules/users/domain/ports/IUserRepository';
import { IRoleRepository } from '@modules/roles/domain/ports/IRoleRepository';
import { IProfessorRepository } from '@modules/professors/domain/ports/IProfessorRepository';
import { User } from '@modules/users/domain/entities/User';
import { Professor } from '@modules/professors/domain/entities/Professor';

interface RegisterProfessorInput {
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  pnfId?: string;
  institutionId?: string;
  specialization?: string;
}

@Injectable()
export class RegisterProfessorUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
    @Inject('IProfessorRepository')
    private readonly professorRepository: IProfessorRepository,
    @Inject('IHashService')
    private readonly hashService: { hash: (plain: string) => Promise<string> },
  ) {}

  async execute(input: RegisterProfessorInput) {
    const existingEmail = await this.userRepository.findByEmail(input.email);
    if (existingEmail) {
      throw new ConflictException('El email ya está registrado');
    }

    const existingDni = await this.userRepository.findByDni(input.dni);
    if (existingDni) {
      throw new ConflictException('La cédula ya está registrada');
    }

    const role = await this.roleRepository.findByName('DOCENTE');
    if (!role) {
      throw new NotFoundException('Rol DOCENTE no encontrado');
    }

    const hashedPassword = await this.hashService.hash(input.password);

    const user = new User(
      randomUUID(),
      input.dni,
      input.firstName,
      input.lastName,
      input.email,
      hashedPassword,
      true,
      input.pnfId ?? '',
      input.institutionId ?? '',
      role.id,
      input.phone,
    );

    await this.userRepository.save(user);

    const professor = new Professor(
      randomUUID(),
      user.id,
      input.specialization,
    );

    await this.professorRepository.save(professor);

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roleName: 'DOCENTE',
    };
  }
}
