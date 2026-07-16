import { z } from 'zod';

export const trajectorySchema = z.object({
  pnfId: z.string().uuid('Selecciona un PNF'),
  name: z.string().min(1, 'El nombre es requerido'),
  orderNumber: z.coerce.number().int().min(1, 'El orden debe ser mayor a 0'),
});

export type TrajectoryFormData = z.infer<typeof trajectorySchema>;
