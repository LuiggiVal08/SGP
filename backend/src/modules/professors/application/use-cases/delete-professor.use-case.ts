import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IProfessorRepository } from '../../domain/ports/IProfessorRepository';

@Injectable()
export class DeleteProfessorUseCase {
  constructor(
    @Inject('IProfessorRepository')
    private readonly professorRepository: IProfessorRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const professor = await this.professorRepository.findById(id);
    if (!professor) {
      throw new NotFoundException('Profesor no encontrado');
    }
    await this.professorRepository.delete(id);
  }
}
