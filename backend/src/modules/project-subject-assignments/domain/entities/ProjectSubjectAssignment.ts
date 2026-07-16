export class ProjectSubjectAssignment {
  constructor(
    public readonly id: string,
    public readonly subjectId: string,
    public readonly professorId: string,
    public readonly periodId: string,
  ) {}
}
