import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  BelongsToMany,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { ProjectSubjectAssignmentModel } from '@modules/project-subject-assignments/infrastructure/persistence/sequelize/models/project-subject-assignment.model';
import { CommunityPlaceModel } from '@modules/community-places/infrastructure/persistence/sequelize/models/community-place.model';
import { CommunityTutorModel } from '@modules/community-tutors/infrastructure/persistence/sequelize/models/community-tutor.model';
import { ProjectFileModel } from './project-file.model';
import { ProjectAuthorModel } from './project-author.model';
import { ProjectAcademicTutorModel } from '@modules/project-academic-tutors/infrastructure/persistence/sequelize/models/project-academic-tutor.model';
import { ProfessorModel } from '@modules/professors/infrastructure/persistence/sequelize/models/professor.model';

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
  'id' | 'description' | 'problemStatement' | 'status' | 'cdSubmitted'
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

  @ForeignKey(() => ProjectSubjectAssignmentModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare subjectAssignmentId: string;

  @BelongsTo(() => ProjectSubjectAssignmentModel)
  declare subjectAssignment?: ProjectSubjectAssignmentModel;

  @ForeignKey(() => CommunityPlaceModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare locationId: string;

  @BelongsTo(() => CommunityPlaceModel)
  declare location?: CommunityPlaceModel;

  @ForeignKey(() => CommunityTutorModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare communityTutorId: string;

  @BelongsTo(() => CommunityTutorModel)
  declare communityTutor?: CommunityTutorModel;

  @Column({
    type: DataType.STRING(30),
    defaultValue: 'BORRADOR',
  })
  declare status: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare cdSubmitted: boolean;

  @BelongsToMany(() => ProfessorModel, () => ProjectAuthorModel)
  declare authors?: ProfessorModel[];

  @HasMany(() => ProjectFileModel)
  declare files?: ProjectFileModel[];

  @HasMany(() => ProjectAcademicTutorModel)
  declare academicTutors?: ProjectAcademicTutorModel[];
}
