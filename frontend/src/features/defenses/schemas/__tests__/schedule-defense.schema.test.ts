import { scheduleDefenseSchema } from '@/features/defenses/schemas/schedule-defense.schema';

describe('scheduleDefenseSchema', () => {
  const base = {
    projectId: '123e4567-e89b-12d3-a456-426614174000',
    scheduledDate: '2026-08-01T10:00',
    judges: [
      { judgeType: 'SUBJECT_PROFESSOR', professorId: '123e4567-e89b-12d3-a456-426614174000', communityTutorId: '123e4567-e89b-12d3-a456-426614174001' },
      { judgeType: 'ACADEMIC_TUTOR', professorId: '123e4567-e89b-12d3-a456-426614174002', communityTutorId: '123e4567-e89b-12d3-a456-426614174003' },
      { judgeType: 'COMMUNITY_TUTOR', professorId: '123e4567-e89b-12d3-a456-426614174004', communityTutorId: '123e4567-e89b-12d3-a456-426614174005' },
    ],
  } as const;

  it('should accept a valid defense with 3 distinct judge types', () => {
    expect(scheduleDefenseSchema.safeParse(base).success).toBe(true);
  });

  it('should reject fewer than 3 judges', () => {
    const result = scheduleDefenseSchema.safeParse({ ...base, judges: base.judges.slice(0, 2) });
    expect(result.success).toBe(false);
  });

  it('should reject when judge types are not all distinct', () => {
    const result = scheduleDefenseSchema.safeParse({
      ...base,
      judges: [
        base.judges[0],
        { ...base.judges[1], judgeType: 'SUBJECT_PROFESSOR' as const },
        base.judges[2],
      ],
    });
    expect(result.success).toBe(false);
  });

  it('should reject an invalid projectId', () => {
    const result = scheduleDefenseSchema.safeParse({ ...base, projectId: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  it('should reject a missing scheduledDate', () => {
    const result = scheduleDefenseSchema.safeParse({ ...base, scheduledDate: '' });
    expect(result.success).toBe(false);
  });

  it('should reject a judge with an invalid professorId', () => {
    const result = scheduleDefenseSchema.safeParse({
      ...base,
      judges: [{ ...base.judges[0], professorId: 'bad' }, base.judges[1], base.judges[2] ],
    });
    expect(result.success).toBe(false);
  });
});
