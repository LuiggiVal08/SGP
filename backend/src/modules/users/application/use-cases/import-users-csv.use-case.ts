import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import * as Papa from 'papaparse';
import { IUserRepository } from '../../domain/ports/IUserRepository';
import { IHashService } from '@modules/auth/domain/ports/IHashService';
import { IRoleRepository } from '@modules/roles/domain/ports/IRoleRepository';
import { IPnfRepository } from '@modules/pnf/domain/ports/IPnfRepository';
import { IInstitutionRepository } from '@modules/institutions/domain/ports/IInstitutionRepository';
import { User } from '../../domain/entities/User';
import { ImportUserRowDto } from '../dtos/import-user-row.dto';

export interface CsvImportResult {
  created: number;
  skipped: number;
  errors: string[];
}

@Injectable()
export class ImportUsersCsvUseCase {
  static readonly VALID_ROLES = ['ALUMNO', 'DOCENTE', 'COORDINADOR'];

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

  async execute(csvContent: string): Promise<CsvImportResult> {
    const rows = this.parseCsv(csvContent);
    const result: CsvImportResult = { created: 0, skipped: 0, errors: [] };

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2;
      await this.processRow(rows[i], rowNumber, result);
    }

    return result;
  }

  private parseCsv(csvContent: string): Record<string, string>[] {
    const parsed = Papa.parse<Record<string, string>>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transform: (value) => value.trim(),
    });
    return parsed.data;
  }

  private async processRow(
    raw: Record<string, string>,
    rowNumber: number,
    result: CsvImportResult,
  ): Promise<void> {
    const row = plainToInstance(ImportUserRowDto, raw);
    const validationErrors = await validate(row);
    if (validationErrors.length > 0) {
      result.errors.push(
        `Fila ${rowNumber}: ${this.formatValidationErrors(validationErrors)}`,
      );
      return;
    }

    if (!ImportUsersCsvUseCase.VALID_ROLES.includes(row.roleName)) {
      result.errors.push(
        `Fila ${rowNumber}: rol inválido "${row.roleName}". Roles permitidos: ${ImportUsersCsvUseCase.VALID_ROLES.join(', ')}`,
      );
      return;
    }

    try {
      await this.createUser(row);
      result.created += 1;
    } catch (error) {
      // Duplicate email/dni or invalid pnf/institution -> skip, keep counting.
      result.skipped += 1;
      result.errors.push(`Fila ${rowNumber}: ${this.extractMessage(error)}`);
    }
  }

  private async createUser(row: ImportUserRowDto): Promise<void> {
    const existingEmail = await this.userRepository.findByEmail(row.email);
    if (existingEmail) {
      throw new Error(`el email "${row.email}" ya está registrado`);
    }
    const existingDni = await this.userRepository.findByDni(row.dni);
    if (existingDni) {
      throw new Error(`el DNI "${row.dni}" ya está registrado`);
    }

    const role = await this.roleRepository.findByName(row.roleName);
    if (!role) {
      throw new Error(`el rol "${row.roleName}" no existe`);
    }

    // TODO(K6): Por modelo, pnf.coordinatorId apunta a professors (no a users).
    // Si el CSV marca un usuario como COORDINADOR, se crea como usuario con
    // roleName COORDINADOR; la asignación a un PNF vía coordinatorId queda fuera
    // de alcance de este endpoint (lo cubre otro agente / story).

    if (row.pnfId) {
      const pnf = await this.pnfRepository.findById(row.pnfId);
      if (!pnf) {
        throw new Error('PNF_NOT_FOUND');
      }
    }

    if (row.institutionId) {
      const institution = await this.institutionRepository.findById(
        row.institutionId,
      );
      if (!institution) {
        throw new Error('INSTITUTION_NOT_FOUND');
      }
    }

    const hashedPassword = await this.hashService.hash(row.password);

    const user = new User(
      randomUUID(),
      row.dni,
      row.firstName,
      row.lastName,
      row.email,
      hashedPassword,
      true,
      row.pnfId ?? '',
      row.institutionId ?? '',
      role.id,
    );

    await this.userRepository.save(user);
  }

  private formatValidationErrors(errors: ValidationError[]): string {
    return errors
      .map((e) => Object.values(e.constraints ?? {}).join(', '))
      .join('; ');
  }

  private extractMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
  }
}
