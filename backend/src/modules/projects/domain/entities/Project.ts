export type ProjectStatus = 'COMPLETED' | 'PENDING_VALIDATION' | 'REJECTED';

export class Project {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly year: number,
    public readonly status: ProjectStatus,
    public readonly careerId: string,
    public readonly tutorId: string,
  ) {}
}
