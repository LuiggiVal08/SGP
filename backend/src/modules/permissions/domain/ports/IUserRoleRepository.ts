export interface UserRoleRow {
  userId: string;
  roleId: string;
}

export interface IUserRoleRepository {
  assign(userId: string, roleId: string): Promise<void>;
  remove(userId: string, roleId: string): Promise<void>;
  findRoleIdsByUserId(userId: string): Promise<string[]>;
}
