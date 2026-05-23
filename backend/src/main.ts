// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { env } from './config/env.config'; // Usamos tu config de Zod en lugar de process.env

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Habilitar prefijo global si lo necesitas (ej: /api/v1)
  //   app.setGlobalPrefix('api');

  // Usamos el puerto tipado y validado de Zod
  const port = env.PORT;

  await app.listen(port);
  logger.log(`🚀 Aplicación corriendo en el puerto: ${port}`);
}

bootstrap().catch((error) => {
  const logger = new Logger('Main');
  logger.error('❌ Error fatal al iniciar la aplicación:', error);
});
