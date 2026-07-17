export type CorrectionStatus = 'PENDIENTE' | 'RESUELTA';

export class ProjectCorrection {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly fileId: string,
    public readonly comment: string | null,
    public readonly status: CorrectionStatus,
    public readonly createdBy: string | null,
    public readonly resolvedAt: Date | null,
  ) {}
}
