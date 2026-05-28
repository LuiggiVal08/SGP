import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel } from './infrastructure/persistence/sequelize/models/user.model';
import { UserSequelizeAdapter } from './infrastructure/persistence/sequelize/user-sequelize.adapter';
import { GetUsersUseCase } from './application/use-cases/get-users.use-case';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UserController } from './infrastructure/http/controllers/user.controller';
import { RolesModule } from '@modules/roles/roles.module';
import { BcryptHashAdapter } from '@modules/auth/infrastructure/services/bcrypt-hash.adapter';

@Module({
  imports: [SequelizeModule.forFeature([UserModel]), RolesModule],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: UserSequelizeAdapter,
    },
    {
      provide: 'IHashService',
      useClass: BcryptHashAdapter,
    },
    GetUsersUseCase,
    CreateUserUseCase,
  ],
  controllers: [UserController],
  exports: ['IUserRepository'],
})
export class UsersModule {}
