import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { ProjectModel } from '@modules/projects/infrastructure/persistence/sequelize/models/project.model';
import { ProjectFileModel } from '@modules/projects/infrastructure/persistence/sequelize/models/project-file.model';
import { UserModel } from '@modules/users/infrastructure/persistence/sequelize/models/user.model';

interface ProjectCorrectionAttributes {
  id: string;
  projectId: string;
  fileId: string;
  comment: string | null;
  status: string;
  createdBy: string | null;
  resolvedAt: Date | null;
}

type ProjectCorrectionCreationAttributes = Optional<
  ProjectCorrectionAttributes,
  'id' | 'comment' | 'status' | 'createdBy' | 'resolvedAt'
>;

@Table({ tableName: 'project_corrections', timestamps: true })
export class ProjectCorrectionModel extends Model<
  ProjectCorrectionAttributes,
  ProjectCorrectionCreationAttributes
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

  @ForeignKey(() => ProjectFileModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare fileId: string;

  @BelongsTo(() => ProjectFileModel)
  declare file?: ProjectFileModel;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare comment: string | null;

  @Column({ type: DataType.STRING(20), defaultValue: 'PENDIENTE' })
  declare status: string;

  @ForeignKey(() => UserModel)
  @Column({ type: DataType.UUID, allowNull: true })
  declare createdBy: string | null;

  @BelongsTo(() => UserModel, 'createdBy')
  declare createdByUser?: UserModel;

  @Column({ type: DataType.DATE, allowNull: true })
  declare resolvedAt: Date | null;
}
