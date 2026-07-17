import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IUserRepository } from '../../domain/ports/IUserRepository';
import { IHashService } from '../../../auth/domain/ports/IHashService';
import { IRoleRepository } from '../../../roles/domain/ports/IRoleRepository';
import { IPnfRepository } from '../../../pnf/domain/ports/IPnfRepository';
import { IInstitutionRepository } from '../../../institutions/domain/ports/IInstitutionRepository';
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
    @Inject('IPnfRepository')
    private readonly pnfRepository: IPnfRepository,
    @Inject('IInstitutionRepository')
    private readonly institutionRepository: IInstitutionRepository,
  ) {}

  async execute(data: {
    dni: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roleName: string;
    pnfId?: string;
    institutionId?: string;
    phone?: string;
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

    if (data.pnfId) {
      const pnf = await this.pnfRepository.findById(data.pnfId);
      if (!pnf) {
        throw new BadRequestException(
          `La PNF con ID "${data.pnfId}" no existe`,
        );
      }
    }

    if (data.institutionId) {
      const institution = await this.institutionRepository.findById(
        data.institutionId,
      );
      if (!institution) {
        throw new BadRequestException(
          `La institución con ID "${data.institutionId}" no existe`,
        );
      }
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
      data.pnfId ?? '',
      data.institutionId ?? '',
      role.id,
      data.phone,
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
