export type ProjectStatus = 'PENDING_VALIDATION' | 'COMPLETED' | 'REJECTED';

export type FileType = 'TOMO' | 'RESUMEN';

export interface CommunityTutorData {
  id?: string;
  fullName: string;
  dni?: string;
  phone?: string;
  email?: string;
  organization?: string;
  position?: string;
  notes?: string;
}

export interface Project {
  id: string;
  title: string;
  year: number;
  status: ProjectStatus;
  pnfId: string;
  tutorId: string;
  authors?: { id: string; firstName: string; lastName: string; email: string }[];
  tutor?: { id: string; firstName: string; lastName: string; email: string };
  pnf?: { id: string; name: string };
  communityTutor?: CommunityTutorData;
  methodology?: string | null;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  fileName: string;
  urlPath: string;
  fileType: FileType;
  createdAt?: string;
}

export interface ProjectFilters {
  pnfId?: string;
  tutorId?: string;
  status?: ProjectStatus;
  yearFrom?: number;
  yearTo?: number;
  authorId?: string;
  methodology?: string;
}

export interface CreateProjectPayload {
  title: string;
  year: number;
  pnfId: string;
  authorIds: string[];
  tutorId: string;
  isExceptional?: boolean;
  communityTutor?: CommunityTutorData;
  methodology?: string;
}

export type UpdateProjectPayload = Partial<CreateProjectPayload>;

export interface CartaCulminacion {
  id: string;
  projectId: string;
  userId: string;
  pdfUrl: string | null;
}

