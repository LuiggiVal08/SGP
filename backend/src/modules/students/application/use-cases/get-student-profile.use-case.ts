import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IStudentRepository } from '../../domain/ports/IStudentRepository';
import type { StudentProfileDto } from '../../infrastructure/http/dtos/student-profile.dto';

@Injectable()
export class GetStudentProfileUseCase {
  constructor(
    @Inject('IStudentRepository')
    private readonly studentRepository: IStudentRepository,
  ) {}

  async execute(id: string): Promise<StudentProfileDto> {
    const profile = await this.studentRepository.findProfileById(id);
    if (!profile) {
      throw new NotFoundException('Estudiante no encontrado');
    }
    return profile;
  }
}
