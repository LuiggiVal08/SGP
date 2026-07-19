import { z } from 'zod';

export const institutionSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  acronym: z.string().optional().default(''),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  contactInfo: z.string().optional().default(''),
});

export type InstitutionFormData = z.infer<typeof institutionSchema>;
export type InstitutionFormInput = z.input<typeof institutionSchema>;
