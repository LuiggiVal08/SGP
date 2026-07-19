import { z } from 'zod';

export const registerStudentSchema = z.object({
  dni: z.string().min(1, 'La cédula es requerida'),
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  enrollmentNumber: z.string().min(1, 'El número de expediente es requerido'),
  cohort: z.coerce.number().int().min(2000, 'Año de cohorte inválido'),
  currentTrayecto: z.coerce.number().int().min(1).max(3).default(1),
  pnfId: z.string().optional(),
  institutionId: z.string().optional(),
  phone: z.string().optional(),
});

export type RegisterStudentFormData = z.infer<typeof registerStudentSchema>;
export type RegisterStudentFormInput = z.input<typeof registerStudentSchema>;
