import { z } from 'zod';
import type { JudgeType } from '../types/defense.types';

const JUDGE_TYPES: JudgeType[] = ['SUBJECT_PROFESSOR', 'ACADEMIC_TUTOR', 'COMMUNITY_TUTOR'];

export const judgeSchema = z.object({
  judgeType: z.enum(['SUBJECT_PROFESSOR', 'ACADEMIC_TUTOR', 'COMMUNITY_TUTOR']),
  professorId: z.string().uuid('Seleccione un profesor'),
  communityTutorId: z.string().uuid('Seleccione un tutor comunitario'),
});

export const scheduleDefenseSchema = z
  .object({
    projectId: z.string().uuid('Seleccione un proyecto'),
    scheduledDate: z
      .string()
      .min(1, 'Seleccione una fecha y hora')
      .refine((v) => !Number.isNaN(Date.parse(v)), 'Fecha inválida'),
    judges: z.array(judgeSchema).min(3, 'Deben asignarse 3 jurados'),
  })
  .refine(
    (data) => {
      const present = new Set(data.judges.map((j) => j.judgeType));
      return JUDGE_TYPES.every((t) => present.has(t));
    },
    {
      message: 'Debe haber un jurado de cada tipo (asignatura, académico, comunitario)',
      path: ['judges'],
    },
  );

export type ScheduleDefenseFormData = z.infer<typeof scheduleDefenseSchema>;
