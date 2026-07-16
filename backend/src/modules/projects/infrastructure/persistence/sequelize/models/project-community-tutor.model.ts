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

interface ProjectCommunityTutorAttributes {
  id: string;
  projectId: string;
  fullName: string;
  dni?: string;
  phone?: string;
  email?: string;
  organization?: string;
  position?: string;
  notes?: string;
}

type ProjectCommunityTutorCreationAttributes = Optional<
  ProjectCommunityTutorAttributes,
  'id'
>;

@Table({ tableName: 'project_community_tutors', timestamps: true })
export class ProjectCommunityTutorModel extends Model<
  ProjectCommunityTutorAttributes,
  ProjectCommunityTutorCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => ProjectModel)
  @Column({ type: DataType.UUID, allowNull: false, unique: true })
  declare projectId: string;

  @BelongsTo(() => ProjectModel)
  declare project?: ProjectModel;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare fullName: string;

  @Column({ type: DataType.STRING(15), allowNull: true })
  declare dni: string | undefined;

  @Column({ type: DataType.STRING(20), allowNull: true })
  declare phone: string | undefined;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare email: string | undefined;

  @Column({ type: DataType.STRING(200), allowNull: true })
  declare organization: string | undefined;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare position: string | undefined;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare notes: string | undefined;
}
