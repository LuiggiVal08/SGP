// backend/src/config/env.config.ts
import * as z from 'zod';

export const envValidationSchema = z.object({
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1),
  DB_SYNCHRONIZE: z.coerce.boolean().default(false),
  PORT: z.coerce.number().default(3000),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
});

export type EnvVars = z.infer<typeof envValidationSchema>;

// Validamos el process.env una sola vez al cargar la app
export const env = envValidationSchema.parse(process.env);
