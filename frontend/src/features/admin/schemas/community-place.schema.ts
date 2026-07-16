import { z } from 'zod';

const PLACE_TYPES = ['COMMUNITY', 'ORGANIZATION', 'INSTITUTION', 'COMPANY'] as const;

export const communityPlaceSchema = z.object({
  institutionId: z.string().uuid('Selecciona una institución'),
  name: z.string().min(1, 'El nombre es requerido').max(200, 'Máximo 200 caracteres'),
  type: z.enum(PLACE_TYPES, { message: 'Selecciona un tipo' }),
  description: z.string().optional().default(''),
  address: z.string().optional().default(''),
  contactPhone: z.string().max(20, 'Máximo 20 caracteres').optional().default(''),
  contactEmail: z.string().email('Email inválido').optional().or(z.literal('')),
});

export type CommunityPlaceFormData = z.infer<typeof communityPlaceSchema>;
