export type DefenseStatus = 'PROGRAMADA' | 'REALIZADA' | 'APLAZADA' | 'CANCELADA';

export type JudgeType = 'SUBJECT_PROFESSOR' | 'ACADEMIC_TUTOR' | 'COMMUNITY_TUTOR';

export interface DefenseJudge {
  id: string;
  judgeType: JudgeType;
  professorId: string | null;
  communityTutorId: string | null;
  professor?: { id: string; firstName: string; lastName: string } | null;
  communityTutor?: { id: string; fullName: string } | null;
}

export interface Defense {
  id: string;
  projectId: string;
  scheduledDate: string;
  status: DefenseStatus;
  realizedAt: string | null;
  judges: DefenseJudge[];
  project?: { id: string; title: string } | null;
  scheduleChanges?: DefenseScheduleChange[];
}

export interface DefenseScheduleChange {
  id: string;
  previousDate: string;
  newDate: string;
  reason: string | null;
  changedBy: string | null;
  changedAt: string;
}

export interface ScheduleDefenseJudgeInput {
  judgeType: JudgeType;
  professorId: string;
  communityTutorId: string;
}

export interface ScheduleDefenseInput {
  projectId: string;
  scheduledDate: string;
  judges: ScheduleDefenseJudgeInput[];
}

export interface RescheduleDefenseInput {
  scheduledDate: string;
  reason?: string;
  changedBy?: string;
}

export const defenseStatusConfig: Record<
  DefenseStatus,
  { color: 'success' | 'warning' | 'danger' | 'default'; label: string }
> = {
  PROGRAMADA: { color: 'warning', label: 'Programada' },
  REALIZADA: { color: 'success', label: 'Realizada' },
  APLAZADA: { color: 'default', label: 'Aplazada' },
  CANCELADA: { color: 'danger', label: 'Cancelada' },
};

export const judgeTypeLabels: Record<JudgeType, string> = {
  SUBJECT_PROFESSOR: 'Profesor de la asignatura',
  ACADEMIC_TUTOR: 'Tutor académico',
  COMMUNITY_TUTOR: 'Tutor comunitario',
};
