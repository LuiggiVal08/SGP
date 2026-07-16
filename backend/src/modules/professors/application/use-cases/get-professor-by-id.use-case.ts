import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IProfessorRepository } from '../../domain/ports/IProfessorRepository';
import { Professor } from '../../domain/entities/Professor';

@Injectable()
export class GetProfessorByIdUseCase {
  constructor(
    @Inject('IProfessorRepository')
    private readonly professorRepository: IProfessorRepository,
  ) {}

  async execute(id: string): Promise<Professor> {
    const professor = await this.professorRepository.findById(id);
    if (!professor) {
      throw new NotFoundException('Profesor no encontrado');
    }
    return professor;
  }
}
