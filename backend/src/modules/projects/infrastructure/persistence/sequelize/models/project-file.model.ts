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

interface ProjectFileAttributes {
  id: string;
  projectId: string;
  fileName: string;
  urlPath: string;
  fileType: string;
}

type ProjectFileCreationAttributes = Optional<ProjectFileAttributes, 'id'>;

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

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare fileName: string;

  @Column({ type: DataType.STRING(500), allowNull: false })
  declare urlPath: string;

  @Column({ type: DataType.STRING(30), allowNull: false })
  declare fileType: string;
}
