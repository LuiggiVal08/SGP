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
      autoLoadModels: true, // 👈 Busca dinámicamente los modelos en los módulos
      synchronize: true, // 👈 Sincroniza automáticamente en desarrollo
      logging: false,
    }),
  ],
  exports: [SequelizeModule], // 👈 Exportamos para que forFeature funcione en tus submódulos
})
export class DatabaseModule {}
