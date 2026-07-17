import { z } from 'zod';

export const communityTutorSchema = z.object({
  locationId: z.string().uuid('Selecciona un lugar comunitario'),
  fullName: z.string().optional().default(''),
  dni: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  position: z.string().optional().default(''),
});

export type CommunityTutorFormData = z.infer<typeof communityTutorSchema>;
