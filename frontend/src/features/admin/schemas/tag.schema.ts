import { z } from 'zod';

const TAG_CATEGORIES = ['TECNOLOGIA', 'TEMA', 'TUTOR', 'METODOLOGIA'] as const;

export const tagSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  category: z.enum(TAG_CATEGORIES, { message: 'Selecciona una categoría' }),
});

export type TagFormData = z.infer<typeof tagSchema>;
