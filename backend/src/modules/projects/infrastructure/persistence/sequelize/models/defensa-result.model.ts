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

interface DefensaResultAttributes {
  id: string;
  projectId: string;
  registeredBy: string;
  juezDocente: string;
  juezTutorInstitucional: string;
  juezTutorComunitario: string;
  notaGrupal: number;
  notasIndividuales: Record<string, number>;
  cartaAprobacionUrl: string | null;
}

type DefensaResultCreationAttributes = Optional<
  DefensaResultAttributes,
  'id' | 'cartaAprobacionUrl'
>;

@Table({ tableName: 'defensa_results', timestamps: true })
export class DefensaResultModel extends Model<
  DefensaResultAttributes,
  DefensaResultCreationAttributes
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
  @Column({ type: DataType.UUID, allowNull: false })
  declare registeredBy: string;

  @BelongsTo(() => UserModel, 'registeredBy')
  declare registrar?: UserModel;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare juezDocente: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare juezTutorInstitucional: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare juezTutorComunitario: string;

  @Column({ type: DataType.DECIMAL(5, 2), allowNull: false })
  declare notaGrupal: number;

  @Column({ type: DataType.JSON, allowNull: false })
  declare notasIndividuales: Record<string, number>;

  @Column({ type: DataType.STRING(500), allowNull: true })
  declare cartaAprobacionUrl: string | null;
}
