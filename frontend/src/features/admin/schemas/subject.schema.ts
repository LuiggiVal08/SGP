import { z } from 'zod';

export const subjectSchema = z.object({
  trajectoryId: z.string().uuid('Selecciona un trayecto'),
  name: z.string().min(1, 'El nombre es requerido'),
});

export type SubjectFormData = z.infer<typeof subjectSchema>;
