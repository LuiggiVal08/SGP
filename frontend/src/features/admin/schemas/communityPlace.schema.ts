import { z } from 'zod';

export const communityPlaceSchema = z.object({
  institutionId: z.string().uuid('Selecciona una institución'),
  name: z.string().min(1, 'El nombre es requerido'),
  type: z.enum(['COMMUNITY', 'ORGANIZATION', 'INSTITUTION', 'COMPANY']),
  description: z.string().optional().default(''),
  address: z.string().optional().default(''),
  contactPhone: z.string().optional().default(''),
  contactEmail: z.string().email('Email inválido').optional().or(z.literal('')),
});

export type CommunityPlaceFormData = z.infer<typeof communityPlaceSchema>;
