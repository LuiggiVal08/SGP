import { Injectable, Inject } from '@nestjs/common';
import { IProfessorRepository } from '../../domain/ports/IProfessorRepository';

@Injectable()
export class GetAllProfessorsUseCase {
  constructor(
    @Inject('IProfessorRepository')
    private readonly professorRepository: IProfessorRepository,
  ) {}

  async execute(dto: { page?: number; limit?: number; search?: string }) {
    return this.professorRepository.findAllPaginated(dto);
  }
}
