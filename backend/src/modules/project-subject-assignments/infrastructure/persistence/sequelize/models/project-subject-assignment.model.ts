import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { SubjectModel } from '@modules/subjects/infrastructure/persistence/sequelize/models/subject.model';
import { ProfessorModel } from '@modules/professors/infrastructure/persistence/sequelize/models/professor.model';
import { PeriodModel } from '@modules/periods/infrastructure/persistence/sequelize/models/period.model';

interface ProjectSubjectAssignmentAttributes {
  id: string;
  subjectId: string;
  professorId: string;
  periodId: string;
}

type ProjectSubjectAssignmentCreationAttributes = Optional<
  ProjectSubjectAssignmentAttributes,
  'id'
>;

@Table({
  tableName: 'project_subject_assignments',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['subjectId', 'professorId', 'periodId'],
      name: 'uniq_subject_professor_period',
    },
  ],
})
export class ProjectSubjectAssignmentModel extends Model<
  ProjectSubjectAssignmentAttributes,
  ProjectSubjectAssignmentCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => SubjectModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare subjectId: string;

  @BelongsTo(() => SubjectModel)
  declare subject?: SubjectModel;

  @ForeignKey(() => ProfessorModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare professorId: string;

  @BelongsTo(() => ProfessorModel)
  declare professor?: ProfessorModel;

  @ForeignKey(() => PeriodModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare periodId: string;

  @BelongsTo(() => PeriodModel)
  declare period?: PeriodModel;
}
