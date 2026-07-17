import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().default('/api'),
});

const parsed = envSchema.safeParse(import.meta.env);

export const env = parsed.success
  ? parsed.data
  : { VITE_API_BASE_URL: '/api' };

export const API_BASE_URL = env.VITE_API_BASE_URL;
