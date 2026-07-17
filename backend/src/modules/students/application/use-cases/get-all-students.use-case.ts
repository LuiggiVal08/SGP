import { Injectable, Inject } from '@nestjs/common';
import { IStudentRepository } from '../../domain/ports/IStudentRepository';

@Injectable()
export class GetAllStudentsUseCase {
  constructor(
    @Inject('IStudentRepository')
    private readonly studentRepository: IStudentRepository,
  ) {}

  async execute(dto: { page?: number; limit?: number; search?: string }) {
    return this.studentRepository.findAllPaginated(dto);
  }
}
