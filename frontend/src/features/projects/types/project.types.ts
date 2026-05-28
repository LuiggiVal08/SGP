export type ProjectStatus = 'PENDING_VALIDATION' | 'COMPLETED' | 'REJECTED';

export type FileType = 'THESIS_PDF' | 'SOURCE_CODE' | 'BUSINESS_PLAN';

export interface Project {
  id: string;
  title: string;
  year: number;
  status: ProjectStatus;
  careerId: string;
  tutorId: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  fileName: string;
  urlPath: string;
  fileType: FileType;
}

export interface CreateProjectPayload {
  title: string;
  year: number;
  careerId: string;
  authorIds: string[];
  tutorId: string;
}
