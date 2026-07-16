import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  phone: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
