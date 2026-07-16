import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { ProjectModel } from './project.model';
import { UserModel } from '@modules/users/infrastructure/persistence/sequelize/models/user.model';
import { ProjectRevisionModel } from './project-revision.model';

export type MilestoneType = 'TRIMESTRE' | 'DEFENSA';
export type MilestoneStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface ProjectMilestoneAttributes {
  id: string;
  projectId: string;
  type: MilestoneType;
  trimestre: number | null;
  status: MilestoneStatus;
  approvedBy: string | null;
  approvedAt: Date | null;
}

type ProjectMilestoneCreationAttributes = Optional<
  ProjectMilestoneAttributes,
  'id' | 'status' | 'approvedBy' | 'approvedAt'
>;

@Table({ tableName: 'project_milestones', timestamps: true })
export class ProjectMilestoneModel extends Model<
  ProjectMilestoneAttributes,
  ProjectMilestoneCreationAttributes
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

  @Column({ type: DataType.STRING(20), allowNull: false })
  declare type: MilestoneType;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare trimestre: number | null;

  @Column({ type: DataType.STRING(20), defaultValue: 'PENDING' })
  declare status: MilestoneStatus;

  @ForeignKey(() => UserModel)
  @Column({ type: DataType.UUID, allowNull: true })
  declare approvedBy: string | null;

  @BelongsTo(() => UserModel, 'approvedBy')
  declare approver?: UserModel;

  @Column({ type: DataType.DATE, allowNull: true })
  declare approvedAt: Date | null;

  @HasMany(() => ProjectRevisionModel)
  declare revisions?: ProjectRevisionModel[];
}
