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

interface ProjectFileAttributes {
  id: string;
  projectId: string;
  uploadedBy: string | null;
  documentType: string;
  fileName: string;
  urlPath: string;
  mimeType: string;
  size: number;
  version: number;
}

type ProjectFileCreationAttributes = Optional<ProjectFileAttributes, 'id' | 'uploadedBy'>;

@Table({ tableName: 'project_files', timestamps: true })
export class ProjectFileModel extends Model<
  ProjectFileAttributes,
  ProjectFileCreationAttributes
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
  @Column({ type: DataType.UUID, allowNull: true })
  declare uploadedBy: string | null;

  @BelongsTo(() => UserModel, 'uploadedBy')
  declare uploader?: UserModel;

  @Column({ type: DataType.STRING(50), allowNull: false })
  declare documentType: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare fileName: string;

  @Column({ type: DataType.STRING(500), allowNull: false })
  declare urlPath: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare mimeType: string;

  @Column({ type: DataType.BIGINT, allowNull: false })
  declare size: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  declare version: number;
}
