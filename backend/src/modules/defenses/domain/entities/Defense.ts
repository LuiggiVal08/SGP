export type DefenseStatus =
  'PROGRAMADA' | 'REALIZADA' | 'APLAZADA' | 'CANCELADA';

export class Defense {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly scheduledDate: Date,
    public readonly actualDate: Date | null,
    public readonly status: DefenseStatus,
  ) {}
}
