import { z } from 'zod';

export const periodSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  startDate: z.string().min(1, 'La fecha de inicio es requerida'),
  endDate: z.string().min(1, 'La fecha de fin es requerida'),
  isActive: z.boolean().optional().default(true),
});

export type PeriodFormData = z.infer<typeof periodSchema>;
