export type ProjectStatus =
  | 'BORRADOR'
  | 'EN_PROCESO'
  | 'ENTREGADO'
  | 'APROBADO'
  | 'RECHAZADO';

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
