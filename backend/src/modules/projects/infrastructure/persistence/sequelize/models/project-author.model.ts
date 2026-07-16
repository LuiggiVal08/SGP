import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ProjectModel } from './project.model';
import { UserModel } from '@modules/users/infrastructure/persistence/sequelize/models/user.model';

@Table({ tableName: 'project_authors', timestamps: false })
export class ProjectAuthorModel extends Model {
  @ForeignKey(() => ProjectModel)
  @Column({ type: DataType.UUID, allowNull: false, primaryKey: true })
  declare projectId: string;

  @BelongsTo(() => ProjectModel)
  declare project?: ProjectModel;

  @ForeignKey(() => UserModel)
  @Column({ type: DataType.UUID, allowNull: false, primaryKey: true })
  declare userId: string;

  @BelongsTo(() => UserModel)
  declare user?: UserModel;
}
