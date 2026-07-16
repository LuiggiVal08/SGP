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
import { StudentModel } from '@modules/students/infrastructure/persistence/sequelize/models/student.model';

interface ProjectAuthorAttributes {
  id: string;
  projectId: string;
  studentId: string;
  authorOrder: number;
}

type ProjectAuthorCreationAttributes = Optional<ProjectAuthorAttributes, 'id' | 'authorOrder'>;

@Table({
  tableName: 'project_authors',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['projectId', 'studentId'],
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

  @ForeignKey(() => StudentModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare studentId: string;

  @BelongsTo(() => StudentModel)
  declare student?: StudentModel;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  declare authorOrder: number;
}
