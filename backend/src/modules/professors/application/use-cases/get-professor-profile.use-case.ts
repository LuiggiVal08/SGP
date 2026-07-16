import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IProfessorRepository } from '../../domain/ports/IProfessorRepository';
import type { ProfessorProfileDto } from '../../infrastructure/http/dtos/professor-profile.dto';

@Injectable()
export class GetProfessorProfileUseCase {
  constructor(
    @Inject('IProfessorRepository')
    private readonly professorRepository: IProfessorRepository,
  ) {}

  async execute(id: string): Promise<ProfessorProfileDto> {
    const profile = await this.professorRepository.findProfileById(id);
    if (!profile) {
      throw new NotFoundException('Profesor no encontrado');
    }
    return profile;
  }
}
