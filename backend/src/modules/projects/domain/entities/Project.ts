export type ProjectStatus =
  'BORRADOR' | 'EN_PROCESO' | 'ENTREGADO' | 'APROBADO' | 'RECHAZADO';

export type MilestoneType = 'ENTREGA_TOMO' | 'REVISION' | 'OTRA';
export type MilestoneStatus =
  'PENDIENTE' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO';

export class Project {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly problemStatement: string | null,
    public readonly subjectAssignmentId: string,
    public readonly locationId: string,
    public readonly communityTutorId: string,
    public readonly status: ProjectStatus,
    public readonly cdSubmitted: boolean,
  ) {}
}

export class ProjectMilestone {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly type: MilestoneType,
    public readonly stage: number | null,
    public readonly status: MilestoneStatus,
    public readonly dueDate: Date | null,
    public readonly submittedAt: Date | null,
    public readonly reviewedAt: Date | null,
    public readonly approvedBy: string | null,
    public readonly approvedAt: Date | null,
  ) {}
}

export class ProjectRevision {
  constructor(
    public readonly id: string,
    public readonly milestoneId: string,
    public readonly revisedBy: string,
    public readonly comment: string,
    public readonly statusBefore: MilestoneStatus,
    public readonly statusAfter: MilestoneStatus,
  ) {}
}

export interface DefensaResultData {
  id: string;
  projectId: string;
  registeredBy: string;
  juezDocente: string;
  juezTutorInstitucional: string;
  juezTutorComunitario: string;
  notaGrupal: number;
  notasIndividuales: Record<string, number>;
  cartaAprobacionUrl: string | null;
}

export interface CommunityTutorData {
  name: string;
  dni: string;
  phone: string;
  email: string;
  position: string;
}

export interface CartaCulminacionData {
  id: string;
  projectId: string;
  userId: string;
  pdfUrl: string;
}
