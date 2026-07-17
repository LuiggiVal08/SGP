export class ProjectAcademicTutor {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly professorId: string,
    public readonly assignedAt: Date,
    public readonly active: boolean,
  ) {}
}
