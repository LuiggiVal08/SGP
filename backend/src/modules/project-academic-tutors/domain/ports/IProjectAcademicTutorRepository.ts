import { ProjectAcademicTutor } from '../entities/ProjectAcademicTutor';

export interface IProjectAcademicTutorRepository {
  findByProject(projectId: string): Promise<ProjectAcademicTutor[]>;
  findByUnique(
    projectId: string,
    professorId: string,
  ): Promise<ProjectAcademicTutor | null>;
  save(tutor: ProjectAcademicTutor): Promise<void>;
  remove(projectId: string, professorId: string): Promise<void>;
}
