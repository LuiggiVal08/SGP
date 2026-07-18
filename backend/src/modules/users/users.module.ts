import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel } from './infrastructure/persistence/sequelize/models/user.model';
import { UserSequelizeAdapter } from './infrastructure/persistence/sequelize/user-sequelize.adapter';
import { GetUsersUseCase } from './application/use-cases/get-users.use-case';
import { GetMeUseCase } from './application/use-cases/get-me.use-case';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { ImportUsersCsvUseCase } from './application/use-cases/import-users-csv.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { ToggleUserActiveUseCase } from './application/use-cases/toggle-user-active.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';
import { AdminUpdateUserUseCase } from './application/use-cases/admin-update-user.use-case';
import { UserController } from './infrastructure/http/controllers/user.controller';
import { RolesModule } from '@modules/roles/roles.module';
import { BcryptHashAdapter } from '@modules/auth/infrastructure/services/bcrypt-hash.adapter';
import { PnfModule } from '@modules/pnf/pnf.module';
import { InstitutionsModule } from '@modules/institutions/institutions.module';

@Module({
  imports: [
    SequelizeModule.forFeature([UserModel]),
    RolesModule,
    forwardRef(() => PnfModule),
    forwardRef(() => InstitutionsModule),
  ],
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
    GetMeUseCase,
    CreateUserUseCase,
    ImportUsersCsvUseCase,
    UpdateUserUseCase,
    ToggleUserActiveUseCase,
    DeleteUserUseCase,
    AdminUpdateUserUseCase,
  ],
  controllers: [UserController],
  exports: ['IUserRepository'],
})
export class UsersModule {}
