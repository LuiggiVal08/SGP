// src/share/infrastructure/modules/database.module.ts
import { Module, Global } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { env } from '@config/env.config';

@Global()
@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: env.DB_HOST,
      port: env.DB_PORT,
      username: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      autoLoadModels: true,
      synchronize: env.DB_SYNCHRONIZE,
      dialectOptions: {
        charset: 'utf8mb4',
      },
      define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
      },
      logging: false,
    }),
  ],
  exports: [SequelizeModule], // 👈 Exportamos para que forFeature funcione en tus submódulos
})
export class DatabaseModule {}
