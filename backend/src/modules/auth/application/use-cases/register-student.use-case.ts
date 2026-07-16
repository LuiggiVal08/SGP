import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IUserRepository } from '@modules/users/domain/ports/IUserRepository';
import { IRoleRepository } from '@modules/roles/domain/ports/IRoleRepository';
import { IStudentRepository } from '@modules/students/domain/ports/IStudentRepository';
import { User } from '@modules/users/domain/entities/User';
import { Student } from '@modules/students/domain/entities/Student';

interface RegisterStudentInput {
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  pnfId?: string;
  institutionId?: string;
  enrollmentNumber: string;
  cohort: number;
  currentTrayecto?: number;
}

@Injectable()
export class RegisterStudentUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
    @Inject('IStudentRepository')
    private readonly studentRepository: IStudentRepository,
    @Inject('IHashService')
    private readonly hashService: { hash: (plain: string) => Promise<string> },
  ) {}

  async execute(input: RegisterStudentInput) {
    const existingEmail = await this.userRepository.findByEmail(input.email);
    if (existingEmail) {
      throw new ConflictException('El email ya está registrado');
    }

    const existingDni = await this.userRepository.findByDni(input.dni);
    if (existingDni) {
      throw new ConflictException('La cédula ya está registrada');
    }

    const existingEnrollment =
      await this.studentRepository.findByEnrollmentNumber(
        input.enrollmentNumber,
      );
    if (existingEnrollment) {
      throw new ConflictException('El número de expediente ya está registrado');
    }

    const role = await this.roleRepository.findByName('STUDENT');
    if (!role) {
      throw new NotFoundException('Rol STUDENT no encontrado');
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

    const student = new Student(
      randomUUID(),
      user.id,
      input.enrollmentNumber,
      input.cohort,
      input.currentTrayecto ?? 1,
    );

    await this.studentRepository.save(student);

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roleName: 'STUDENT',
    };
  }
}
