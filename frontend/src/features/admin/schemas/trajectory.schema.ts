import { z } from 'zod';

export const trajectorySchema = z.object({
  pnfId: z.string().uuid('Selecciona un PNF'),
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  orderNumber: z.number().int('Debe ser un número entero').min(1, 'Mínimo 1'),
});

export type TrajectoryFormData = z.infer<typeof trajectorySchema>;
export type TrajectoryFormInput = z.input<typeof trajectorySchema>;
