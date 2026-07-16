import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { UserModel } from '@modules/users/infrastructure/persistence/sequelize/models/user.model';
import { ProjectModel } from '@modules/projects/infrastructure/persistence/sequelize/models/project.model';
import { InstitutionModel } from '@modules/institutions/infrastructure/persistence/sequelize/models/institution.model';
import { ProfessorModel } from '@modules/professors/infrastructure/persistence/sequelize/models/professor.model';

interface PnfAttributes {
  id: string;
  name: string;
  institutionId: string;
  coordinatorId: string | null;
}

type PnfCreationAttributes = Optional<PnfAttributes, 'id'>;

@Table({ tableName: 'pnfs', timestamps: true })
export class PnfModel extends Model<PnfAttributes, PnfCreationAttributes> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare name: string;

  @ForeignKey(() => InstitutionModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare institutionId: string;

  @BelongsTo(() => InstitutionModel)
  declare institution?: InstitutionModel;

  @ForeignKey(() => ProfessorModel)
  @Column({ type: DataType.UUID, allowNull: true })
  declare coordinatorId: string | null;

  @BelongsTo(() => ProfessorModel)
  declare coordinator?: ProfessorModel;

  @HasMany(() => UserModel)
  declare users?: UserModel[];

  @HasMany(() => ProjectModel)
  declare projects?: ProjectModel[];
}
