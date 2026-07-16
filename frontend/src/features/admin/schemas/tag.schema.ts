import { z } from 'zod';

export const tagSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  category: z.enum(['TECNOLOGIA', 'TEMA', 'TUTOR', 'METODOLOGIA']),
});

export type TagFormData = z.infer<typeof tagSchema>;
