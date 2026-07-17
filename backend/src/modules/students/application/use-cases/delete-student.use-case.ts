import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IStudentRepository } from '../../domain/ports/IStudentRepository';

@Injectable()
export class DeleteStudentUseCase {
  constructor(
    @Inject('IStudentRepository')
    private readonly studentRepository: IStudentRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }
    await this.studentRepository.delete(id);
  }
}
