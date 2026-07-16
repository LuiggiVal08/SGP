import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IProjectSubjectAssignmentRepository } from '../../domain/ports/IProjectSubjectAssignmentRepository';
import { ISubjectRepository } from '@modules/subjects/domain/ports/ISubjectRepository';
import { IProfessorRepository } from '@modules/professors/domain/ports/IProfessorRepository';
import { IPeriodRepository } from '@modules/periods/domain/ports/IPeriodRepository';
import { ProjectSubjectAssignment } from '../../domain/entities/ProjectSubjectAssignment';

@Injectable()
export class CreateProjectSubjectAssignmentUseCase {
  constructor(
    @Inject('IProjectSubjectAssignmentRepository')
    private readonly assignmentRepository: IProjectSubjectAssignmentRepository,
    @Inject('ISubjectRepository')
    private readonly subjectRepository: ISubjectRepository,
    @Inject('IProfessorRepository')
    private readonly professorRepository: IProfessorRepository,
    @Inject('IPeriodRepository')
    private readonly periodRepository: IPeriodRepository,
  ) {}

  async execute(input: {
    subjectId: string;
    professorId: string;
    periodId: string;
  }) {
    const subject = await this.subjectRepository.findById(input.subjectId);
    if (!subject) {
      throw new BadRequestException('Subject not found');
    }

    const professor = await this.professorRepository.findById(
      input.professorId,
    );
    if (!professor) {
      throw new BadRequestException('Professor not found');
    }

    const period = await this.periodRepository.findById(input.periodId);
    if (!period) {
      throw new BadRequestException('Period not found');
    }

    const existing = await this.assignmentRepository.findByUnique(
      input.subjectId,
      input.professorId,
      input.periodId,
    );
    if (existing) {
      throw new BadRequestException(
        'This subject-professor-period assignment already exists',
      );
    }

    const assignment = new ProjectSubjectAssignment(
      randomUUID(),
      input.subjectId,
      input.professorId,
      input.periodId,
    );

    await this.assignmentRepository.save(assignment);
    return assignment;
  }
}
