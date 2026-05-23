import { Module, Global, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { env } from '@config/env.config';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const logger = new Logger('RedisModule');
        const client = new Redis({
          host: env.REDIS_HOST,
          port: env.REDIS_PORT,
          retryStrategy: (times) => Math.min(times * 50, 2000),
        });

        client.on('connect', () => {
          logger.log('✅ Conectado a Redis con éxito desde RedisModule');
        });

        client.on('error', (err: Error) => {
          logger.error('❌ Error en el servidor de Redis:', err.message);
        });

        return client;
      },
    },
  ],
  exports: ['REDIS_CLIENT'], // 👈 Lo hace accesible para tus adaptadores
})
export class RedisModule {}
