import {
  Project,
  ProjectStatus,
  ProjectMilestone,
  MilestoneStatus,
  ProjectRevision,
  DefensaResultData,
  CartaCulminacionData,
} from '../entities/Project';
import { ProjectFile } from '../entities/ProjectFile';

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  findAll(): Promise<Project[]>;
  findByStatus(status: ProjectStatus): Promise<Project[]>;
  findBySubjectAssignment(subjectAssignmentId: string): Promise<Project[]>;
  findByLocation(locationId: string): Promise<Project[]>;
  findByCommunityTutor(communityTutorId: string): Promise<Project[]>;
  save(project: Project, studentIds: string[]): Promise<Project>;
  delete(id: string): Promise<void>;
  update(
    id: string,
    data: Partial<
      Pick<
        Project,
        'title' | 'description' | 'problemStatement' | 'status' | 'cdSubmitted'
      >
    >,
  ): Promise<Project>;

  findAllPaginated(params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<{
    data: Project[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>;
  countFiles(projectId: string): Promise<number>;
  countByStatus(status: ProjectStatus): Promise<number>;
  countByYear(year: number): Promise<number>;
  countThisYear(): Promise<number>;
  findRecentActivity(): Promise<Project[]>;

  saveFiles(files: ProjectFile[]): Promise<ProjectFile[]>;
  findFileById(id: string): Promise<ProjectFile | null>;
  findFilesByProjectId(projectId: string): Promise<ProjectFile[]>;
  deleteFile(fileId: string): Promise<void>;
  getMaxVersion(projectId: string, documentType: string): Promise<number>;

  findMilestonesByProject(projectId: string): Promise<ProjectMilestone[]>;
  findMilestoneById(milestoneId: string): Promise<ProjectMilestone | null>;
  createMilestone(
    projectId: string,
    type: string,
    stage?: number,
    dueDate?: Date,
  ): Promise<ProjectMilestone>;
  updateMilestoneStatus(
    milestoneId: string,
    status: MilestoneStatus,
    userId: string,
  ): Promise<ProjectMilestone>;
  findRevisionsByMilestone(milestoneId: string): Promise<ProjectRevision[]>;
  createRevision(revision: ProjectRevision): Promise<ProjectRevision>;

  findDefensaByProject(projectId: string): Promise<DefensaResultData | null>;
  saveDefensa(data: DefensaResultData): Promise<DefensaResultData>;
  findCartasByProject(projectId: string): Promise<CartaCulminacionData[]>;
  createCarta(data: CartaCulminacionData): Promise<CartaCulminacionData>;
  deleteCartasByProject(projectId: string): Promise<void>;
}
