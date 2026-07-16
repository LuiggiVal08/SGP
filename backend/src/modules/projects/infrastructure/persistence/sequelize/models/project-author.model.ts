import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { ProjectModel } from './project.model';
import { ProfessorModel } from '@modules/professors/infrastructure/persistence/sequelize/models/professor.model';

@Table({ tableName: 'project_authors', timestamps: false })
export class ProjectAuthorModel extends Model {
  @ForeignKey(() => ProjectModel)
  @Column({ type: DataType.UUID, allowNull: false, primaryKey: true })
  declare projectId: string;

  @ForeignKey(() => ProfessorModel)
  @Column({ type: DataType.UUID, allowNull: false, primaryKey: true })
  declare professorId: string;
}
