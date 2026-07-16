import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { ProjectModel } from './project.model';
import { UserModel } from '@modules/users/infrastructure/persistence/sequelize/models/user.model';

interface ProjectAuthorAttributes {
  id: string;
  projectId: string;
  userId: string;
}

type ProjectAuthorCreationAttributes = Optional<ProjectAuthorAttributes, 'id'>;

@Table({
  tableName: 'project_authors',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['projectId', 'userId'],
      name: 'uniq_project_student',
    },
  ],
})
export class ProjectAuthorModel extends Model<
  ProjectAuthorAttributes,
  ProjectAuthorCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => ProjectModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare projectId: string;

  @BelongsTo(() => ProjectModel)
  declare project?: ProjectModel;

  @ForeignKey(() => UserModel)
  @Column({ type: DataType.UUID, allowNull: false, primaryKey: true })
  declare userId: string;

  @BelongsTo(() => UserModel)
  declare user?: UserModel;
}
