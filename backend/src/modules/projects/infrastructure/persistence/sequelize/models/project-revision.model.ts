import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import {
  ProjectMilestoneModel,
  MilestoneStatus,
} from './project-milestone.model';
import { UserModel } from '@modules/users/infrastructure/persistence/sequelize/models/user.model';

interface ProjectRevisionAttributes {
  id: string;
  milestoneId: string;
  revisedBy: string;
  comment: string;
  statusBefore: MilestoneStatus;
  statusAfter: MilestoneStatus;
}

type ProjectRevisionCreationAttributes = Optional<
  ProjectRevisionAttributes,
  'id'
>;

@Table({ tableName: 'project_revisions', timestamps: true })
export class ProjectRevisionModel extends Model<
  ProjectRevisionAttributes,
  ProjectRevisionCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => ProjectMilestoneModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare milestoneId: string;

  @BelongsTo(() => ProjectMilestoneModel)
  declare milestone?: ProjectMilestoneModel;

  @ForeignKey(() => UserModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare revisedBy: string;

  @BelongsTo(() => UserModel, 'revisedBy')
  declare reviewer?: UserModel;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare comment: string;

  @Column({ type: DataType.STRING(20), allowNull: false })
  declare statusBefore: MilestoneStatus;

  @Column({ type: DataType.STRING(20), allowNull: false })
  declare statusAfter: MilestoneStatus;
}
