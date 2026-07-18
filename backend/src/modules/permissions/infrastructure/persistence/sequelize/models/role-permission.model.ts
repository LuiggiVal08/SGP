import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
} from 'sequelize-typescript';

@Table({ tableName: 'role_permissions', timestamps: false })
export class RolePermissionModel extends Model {
  @PrimaryKey
  @Column({ type: DataType.UUID, allowNull: false })
  declare roleId: string;

  @PrimaryKey
  @Column({ type: DataType.UUID, allowNull: false })
  declare permissionId: string;
}
