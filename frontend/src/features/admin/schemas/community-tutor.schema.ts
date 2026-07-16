import { z } from 'zod';

export const communityTutorSchema = z.object({
  locationId: z.string().uuid('Selecciona un espacio comunal'),
  fullName: z.string().max(100, 'Máximo 100 caracteres').optional().default(''),
  dni: z.string().max(20, 'Máximo 20 caracteres').optional().default(''),
  phone: z.string().max(20, 'Máximo 20 caracteres').optional().default(''),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  position: z.string().max(100, 'Máximo 100 caracteres').optional().default(''),
});

export type CommunityTutorFormData = z.infer<typeof communityTutorSchema>;
