// backend/src/test-setup.ts
// Cargado por jest (setupFiles) ANTES de cualquier módulo de test.
// Define vars de entorno mínimas para que config/env.config.ts (que hace
// envValidationSchema.parse(process.env) en module-load) no falle en CI,
// donde no hay .env ni secrets reales.
process.env.DB_HOST = process.env.DB_HOST ?? 'localhost';
process.env.DB_PORT = process.env.DB_PORT ?? '3306';
process.env.DB_USER = process.env.DB_USER ?? 'test';
process.env.DB_PASSWORD = process.env.DB_PASSWORD ?? 'test';
process.env.DB_NAME = process.env.DB_NAME ?? 'sgp_test';
process.env.DB_SYNCHRONIZE = process.env.DB_SYNCHRONIZE ?? 'false';
process.env.REDIS_HOST = process.env.REDIS_HOST ?? 'localhost';
process.env.REDIS_PORT = process.env.REDIS_PORT ?? '6379';
process.env.JWT_SECRET =
  process.env.JWT_SECRET ?? 'test-secret-test-secret-test-secret-1234567890';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';
process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';
process.env.PORT = process.env.PORT ?? '3000';
