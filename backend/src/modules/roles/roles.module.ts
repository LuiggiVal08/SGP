import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RoleModel } from './infrastructure/persistence/sequelize/models/role.model';
import { RoleSequelizeAdapter } from './infrastructure/persistence/sequelize/role-sequelize.adapter';
import { GetAllRolesUseCase } from './application/use-cases/get-all-roles.use-case';

@Module({
  imports: [SequelizeModule.forFeature([RoleModel])],
  providers: [
    {
      provide: 'IRoleRepository',
      useClass: RoleSequelizeAdapter,
    },
    GetAllRolesUseCase,
  ],
  exports: ['IRoleRepository'],
})
export class RolesModule {}
