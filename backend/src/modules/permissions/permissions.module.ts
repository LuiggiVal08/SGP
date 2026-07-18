import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RolesModule } from '@modules/roles/roles.module';
import { PermissionModel } from './infrastructure/persistence/sequelize/models/permission.model';
import { RolePermissionModel } from './infrastructure/persistence/sequelize/models/role-permission.model';
import { UserRoleModel } from './infrastructure/persistence/sequelize/models/user-role.model';
import { PermissionSequelizeAdapter } from './infrastructure/persistence/sequelize/permission-sequelize.adapter';
import { RolePermissionSequelizeAdapter } from './infrastructure/persistence/sequelize/role-permission-sequelize.adapter';
import { UserRoleSequelizeAdapter } from './infrastructure/persistence/sequelize/user-role-sequelize.adapter';
import {
  CreatePermissionUseCase,
  UpdatePermissionUseCase,
  DeletePermissionUseCase,
  GetPermissionUseCase,
  ListPermissionsUseCase,
} from './application/use-cases/permission-crud.use-case';
import {
  AssignPermissionToRoleUseCase,
  RemovePermissionFromRoleUseCase,
  ListRolePermissionsUseCase,
} from './application/use-cases/role-permission.use-case';
import {
  AssignRoleToUserUseCase,
  RemoveRoleFromUserUseCase,
  ListUserRolesUseCase,
} from './application/use-cases/user-role.use-case';
import { PermissionController } from './infrastructure/http/controllers/permission.controller';
import { RolePermissionController } from './infrastructure/http/controllers/role-permission.controller';
import { UserRoleController } from './infrastructure/http/controllers/user-role.controller';
import { PermissionsGuard } from './infrastructure/http/guards/permissions.guard';

@Module({
  imports: [
    SequelizeModule.forFeature([
      PermissionModel,
      RolePermissionModel,
      UserRoleModel,
    ]),
    RolesModule,
  ],
  controllers: [
    PermissionController,
    RolePermissionController,
    UserRoleController,
  ],
  providers: [
    {
      provide: 'IPermissionRepository',
      useClass: PermissionSequelizeAdapter,
    },
    {
      provide: 'IRolePermissionRepository',
      useClass: RolePermissionSequelizeAdapter,
    },
    {
      provide: 'IUserRoleRepository',
      useClass: UserRoleSequelizeAdapter,
    },
    CreatePermissionUseCase,
    UpdatePermissionUseCase,
    DeletePermissionUseCase,
    GetPermissionUseCase,
    ListPermissionsUseCase,
    AssignPermissionToRoleUseCase,
    RemovePermissionFromRoleUseCase,
    ListRolePermissionsUseCase,
    AssignRoleToUserUseCase,
    RemoveRoleFromUserUseCase,
    ListUserRolesUseCase,
    PermissionsGuard,
  ],
  exports: [
    'IPermissionRepository',
    'IRolePermissionRepository',
    'IUserRoleRepository',
    PermissionsGuard,
  ],
})
export class PermissionsModule {}
