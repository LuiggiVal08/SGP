import { Project, ProjectStatus } from '../entities/Project';
import { ProjectFile } from '../entities/ProjectFile';

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  findAll(): Promise<Project[]>;
  findByStatus(status: ProjectStatus): Promise<Project[]>;
  save(project: Project, authorIds: string[]): Promise<Project>;
  update(id: string, data: Record<string, unknown>): Promise<Project>;
  saveFiles(files: ProjectFile[]): Promise<ProjectFile[]>;
  findFileById(id: string): Promise<ProjectFile | null>;
  delete(id: string): Promise<void>;
}
