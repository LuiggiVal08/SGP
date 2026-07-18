import { Permission } from '../entities/Permission';

export interface RolePermissionRow {
  roleId: string;
  permissionId: string;
}

export interface IRolePermissionRepository {
  assign(roleId: string, permissionId: string): Promise<void>;
  remove(roleId: string, permissionId: string): Promise<void>;
  findPermissionsByRoleId(roleId: string): Promise<Permission[]>;
  findByRoleId(roleId: string): Promise<RolePermissionRow[]>;
}
