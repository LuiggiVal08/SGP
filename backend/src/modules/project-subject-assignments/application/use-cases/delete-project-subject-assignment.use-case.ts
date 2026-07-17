import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IProjectSubjectAssignmentRepository } from '../../domain/ports/IProjectSubjectAssignmentRepository';

@Injectable()
export class DeleteProjectSubjectAssignmentUseCase {
  constructor(
    @Inject('IProjectSubjectAssignmentRepository')
    private readonly assignmentRepository: IProjectSubjectAssignmentRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const assignment = await this.assignmentRepository.findById(id);
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }
    await this.assignmentRepository.delete(id);
  }
}
