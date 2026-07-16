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
import { ProfessorModel } from '@modules/professors/infrastructure/persistence/sequelize/models/professor.model';

interface ProjectAcademicTutorAttributes {
  id: string;
  projectId: string;
  professorId: string;
  assignedAt: Date;
  active: boolean;
}

type ProjectAcademicTutorCreationAttributes = Optional<
  ProjectAcademicTutorAttributes,
  'id' | 'assignedAt' | 'active'
>;

@Table({
  tableName: 'project_academic_tutors',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['projectId', 'professorId'],
      name: 'uniq_project_professor_tutor',
    },
  ],
})
export class ProjectAcademicTutorModel extends Model<
  ProjectAcademicTutorAttributes,
  ProjectAcademicTutorCreationAttributes
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

  @ForeignKey(() => ProfessorModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare professorId: string;

  @BelongsTo(() => ProfessorModel)
  declare professor?: ProfessorModel;

  @Column({ type: DataType.DATE, allowNull: true })
  declare assignedAt: Date | null;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare active: boolean;
}
