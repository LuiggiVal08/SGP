import { Project, ProjectStatus } from '../entities/Project';
import { ProjectFile } from '../entities/ProjectFile';

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  findAll(): Promise<Project[]>;
  findByStatus(status: ProjectStatus): Promise<Project[]>;
  findByCareer(careerId: string): Promise<Project[]>;
  findByTutor(tutorId: string): Promise<Project[]>;
  save(project: Project, authorIds: string[]): Promise<Project>;
  saveFiles(files: ProjectFile[]): Promise<ProjectFile[]>;
  delete(id: string): Promise<void>;
}
