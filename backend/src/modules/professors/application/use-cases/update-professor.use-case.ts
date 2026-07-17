import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IProfessorRepository } from '../../domain/ports/IProfessorRepository';
import { Professor } from '../../domain/entities/Professor';

@Injectable()
export class UpdateProfessorUseCase {
  constructor(
    @Inject('IProfessorRepository')
    private readonly professorRepository: IProfessorRepository,
  ) {}

  async execute(id: string, data: { specialization?: string }) {
    const existing = await this.professorRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Profesor no encontrado');
    }
    const professor = new Professor(
      id,
      existing.userId,
      data.specialization ?? existing.specialization,
    );
    await this.professorRepository.save(professor);
    return professor;
  }
}
