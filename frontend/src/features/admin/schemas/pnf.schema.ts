import { z } from 'zod';

export const pnfSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  institutionId: z.string().uuid('Selecciona una institución'),
});

export type PnfFormData = z.infer<typeof pnfSchema>;
