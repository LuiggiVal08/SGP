export type CorrectionStatus = 'PENDIENTE' | 'RESUELTA';

export interface ProjectCorrection {
  id: string;
  projectId: string;
  fileId: string;
  comment: string | null;
  status: CorrectionStatus;
  resolvedAt: string | null;
  createdAt: string;
  file?: { id: string; fileName: string; fileType: string } | null;
}

export interface CreateCorrectionInput {
  projectId: string;
  fileId: string;
  comment?: string;
}

export const correctionStatusConfig: Record<
  CorrectionStatus,
  { color: 'warning' | 'success'; label: string }
> = {
  PENDIENTE: { color: 'warning', label: 'Pendiente' },
  RESUELTA: { color: 'success', label: 'Resuelta' },
};
