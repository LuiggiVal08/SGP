export type JudgeType =
  'SUBJECT_PROFESSOR' | 'ACADEMIC_TUTOR' | 'COMMUNITY_TUTOR';

export class DefenseJudge {
  constructor(
    public readonly id: string,
    public readonly defenseId: string,
    public readonly judgeType: JudgeType,
    public readonly professorId: string | null,
    public readonly communityTutorId: string | null,
  ) {}
}
