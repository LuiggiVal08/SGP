import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import { IStudentRepository } from '@modules/students/domain/ports/IStudentRepository';
import { IProfessorRepository } from '@modules/professors/domain/ports/IProfessorRepository';
import { IInstitutionRepository } from '@modules/institutions/domain/ports/IInstitutionRepository';
import { ProjectAuthorModel } from '@modules/projects/infrastructure/persistence/sequelize/models/project-author.model';
import { ProjectAcademicTutorModel } from '@modules/project-academic-tutors/infrastructure/persistence/sequelize/models/project-academic-tutor.model';
import { ProjectSubjectAssignmentModel } from '@modules/project-subject-assignments/infrastructure/persistence/sequelize/models/project-subject-assignment.model';
import { CommunityPlaceModel } from '@modules/community-places/infrastructure/persistence/sequelize/models/community-place.model';
import { ProjectModel } from '@modules/projects/infrastructure/persistence/sequelize/models/project.model';

export interface ScopeUser {
  userId: string;
  role: string;
}

@Injectable()
export class ProjectScopeService {
  constructor(
    private readonly studentRepository: IStudentRepository,
    private readonly professorRepository: IProfessorRepository,
    private readonly institutionRepository: IInstitutionRepository,
  ) {}

  /**
   * Resuelve los IDs de proyecto visibles para el usuario segun su rol (SRS §1).
   * Devuelve `null` cuando el rol ve TODOS los proyectos (ADMIN/IRCOP).
   */
  async resolveAllowedProjectIds(user: ScopeUser): Promise<string[] | null> {
    const role = user.role.toUpperCase();

    if (role === 'ADMIN' || role === 'IRCOP') {
      return null;
    }

    if (role === 'ALUMNO') {
      const student = await this.studentRepository.findByUserId(user.userId);
      if (!student) return [];
      const records = await ProjectAuthorModel.findAll({
        where: { studentId: student.id },
        attributes: ['projectId'],
      });
      return records.map((r) => r.projectId);
    }

    if (role === 'DOCENTE') {
      const professor = await this.professorRepository.findByUserId(
        user.userId,
      );
      if (!professor) return [];
      const [tutorRows, assignmentRows] = await Promise.all([
        ProjectAcademicTutorModel.findAll({
          where: { professorId: professor.id },
          attributes: ['projectId'],
        }),
        ProjectSubjectAssignmentModel.findAll({
          where: { professorId: professor.id },
          attributes: ['id'],
        }),
      ]);
      const tutorIds = tutorRows.map((r) => r.projectId);
      const assignmentIds = assignmentRows.map((r) => r.id);
      const assignmentProjectRows =
        assignmentIds.length > 0
          ? await ProjectModel.findAll({
              where: { subjectAssignmentId: { [Op.in]: assignmentIds } },
              attributes: ['id'],
            })
          : [];
      const assignmentProjectIds = assignmentProjectRows.map((r) => r.id);
      return Array.from(new Set([...tutorIds, ...assignmentProjectIds]));
    }

    if (role === 'COORDINADOR') {
      const professor = await this.professorRepository.findByUserId(
        user.userId,
      );
      if (!professor) return [];
      const institution = await this.institutionRepository.findByCoordinatorId(
        professor.id,
      );
      if (!institution) return [];
      const places = await CommunityPlaceModel.findAll({
        where: { institutionId: institution.id },
        attributes: ['id'],
      });
      const placeIds = places.map((p) => p.id);
      if (placeIds.length === 0) return [];
      const projects = await ProjectModel.findAll({
        where: { locationId: { [Op.in]: placeIds } },
        attributes: ['id'],
      });
      return projects.map((p) => p.id);
    }

    // Rol desconocido: sin visibilidad (defensa por defecto).
    return [];
  }
}
