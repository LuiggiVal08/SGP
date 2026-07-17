import { z } from 'zod';

export const updateUserSchema = z.object({
  dni: z.string().min(1, 'La cédula es requerida'),
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Email inválido'),
  roleName: z.enum(['STUDENT', 'DOCENTE', 'ADMIN', 'IRCOP']),
  pnfId: z.string().optional(),
  institutionId: z.string().optional(),
  phone: z.string().optional(),
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
