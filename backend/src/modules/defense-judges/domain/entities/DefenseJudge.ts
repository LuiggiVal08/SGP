export type JudgeType = 'DOCENTE' | 'TUTOR_INSTITUCIONAL' | 'TUTOR_COMUNITARIO';

export class DefenseJudge {
  constructor(
    public readonly id: string,
    public readonly defenseId: string,
    public readonly judgeType: JudgeType,
    public readonly professorId: string | null,
    public readonly communityTutorId: string | null,
    public readonly score: number | null,
  ) {}
}
