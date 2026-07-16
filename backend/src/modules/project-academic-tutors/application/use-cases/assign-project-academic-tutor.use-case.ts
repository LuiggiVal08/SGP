import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IProjectAcademicTutorRepository } from '../../domain/ports/IProjectAcademicTutorRepository';
import { IProjectRepository } from '@modules/projects/domain/ports/IProjectRepository';
import { IProjectSubjectAssignmentRepository } from '@modules/project-subject-assignments/domain/ports/IProjectSubjectAssignmentRepository';
import { IProfessorRepository } from '@modules/professors/domain/ports/IProfessorRepository';
import { ProjectAcademicTutor } from '../../domain/entities/ProjectAcademicTutor';

@Injectable()
export class AssignProjectAcademicTutorUseCase {
  constructor(
    @Inject('IProjectAcademicTutorRepository')
    private readonly tutorRepository: IProjectAcademicTutorRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('IProjectSubjectAssignmentRepository')
    private readonly assignmentRepository: IProjectSubjectAssignmentRepository,
    @Inject('IProfessorRepository')
    private readonly professorRepository: IProfessorRepository,
  ) {}

  async execute(input: { projectId: string; professorId: string }) {
    const project = await this.projectRepository.findById(input.projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const professor = await this.professorRepository.findById(
      input.professorId,
    );
    if (!professor) {
      throw new BadRequestException('Professor not found');
    }

    const existing = await this.tutorRepository.findByUnique(
      input.projectId,
      input.professorId,
    );
    if (existing) {
      throw new BadRequestException(
        'This professor is already an academic tutor of the project',
      );
    }

    const assignment = await this.assignmentRepository.findById(
      project.subjectAssignmentId,
    );
    if (assignment && assignment.professorId === input.professorId) {
      throw new BadRequestException(
        'The professor that teaches the subject (subject assignment) cannot be an academic tutor of this project',
      );
    }

    const tutor = new ProjectAcademicTutor(
      randomUUID(),
      input.projectId,
      input.professorId,
      new Date(),
      true,
    );

    await this.tutorRepository.save(tutor);
    return tutor;
  }
}
