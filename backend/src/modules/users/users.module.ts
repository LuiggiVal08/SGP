// src/modules/users/users.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel } from './infrastructure/persistence/user.model';
import { UserSequelizeAdapter } from './infrastructure/adapters/user-sequelize.adapter';

@Module({
  imports: [
    SequelizeModule.forFeature([UserModel]), // 👈 Registra el modelo localmente en este módulo
  ],
  providers: [
    {
      provide: 'IUserRepository', // 👈 Token de inyección para mantener desacoplada la interfaz
      useClass: UserSequelizeAdapter,
    },
  ],
  exports: ['IUserRepository'], // Lo exportamos por si el módulo de Auth necesita buscar usuarios
})
export class UsersModule {}
