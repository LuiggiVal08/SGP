import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@share/infrastructure/modules/database.module';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from '@config/env.config';
import { RedisModule } from '@share/infrastructure/modules/redis.module';
import { JwtConfigModule } from '@share/infrastructure/modules/jwt.module';
import modules from './modules';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envValidationSchema.parse(config), // Validará todo al iniciar
    }),
    RedisModule, // Esto inyecta y exporta el servicio de caché basado en Redis
    DatabaseModule, // Esto inyecta y exporta la conexión de Sequelize
    JwtConfigModule, // JwtService global para guards
    ...modules,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
