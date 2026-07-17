import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { ProjectFileModel } from './project-file.model';
import { ProjectAuthorModel } from './project-author.model';
import { ProjectAcademicTutorModel } from '@modules/project-academic-tutors/infrastructure/persistence/sequelize/models/project-academic-tutor.model';

interface ProjectAttributes {
  id: string;
  title: string;
  description: string | null;
  problemStatement: string | null;
  subjectAssignmentId: string;
  locationId: string;
  communityTutorId: string;
  status: string;
  cdSubmitted: boolean;
}

type ProjectCreationAttributes = Optional<
  ProjectAttributes,
  'id' | 'status' | 'cdSubmitted'
>;

@Table({ tableName: 'projects', timestamps: true })
export class ProjectModel extends Model<
  ProjectAttributes,
  ProjectCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare title: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare problemStatement: string | null;

  @Column({ type: DataType.UUID, allowNull: false })
  declare subjectAssignmentId: string;

  @Column({ type: DataType.UUID, allowNull: false })
  declare locationId: string;

  @Column({ type: DataType.UUID, allowNull: false })
  declare communityTutorId: string;

  @Column({
    type: DataType.ENUM(
      'BORRADOR',
      'EN_PROCESO',
      'ENTREGADO',
      'APROBADO',
      'RECHAZADO',
    ),
    allowNull: false,
    defaultValue: 'BORRADOR',
  })
  declare status: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare cdSubmitted: boolean;

  @HasMany(() => ProjectFileModel)
  declare files?: ProjectFileModel[];

  @HasMany(() => ProjectAuthorModel)
  declare authors?: ProjectAuthorModel[];

  @HasMany(() => ProjectAcademicTutorModel)
  declare academicTutors?: ProjectAcademicTutorModel[];
}
