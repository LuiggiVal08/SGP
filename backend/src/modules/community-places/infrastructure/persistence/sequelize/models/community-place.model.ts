import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { InstitutionModel } from '@modules/institutions/infrastructure/persistence/sequelize/models/institution.model';

interface CommunityPlaceAttributes {
  id: string;
  institutionId: string;
  name: string;
  type: string;
  description: string | null;
  address: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
}

type CommunityPlaceCreationAttributes = Optional<
  CommunityPlaceAttributes,
  'id' | 'description' | 'address' | 'contactPhone' | 'contactEmail'
>;

@Table({ tableName: 'community_places', timestamps: true })
export class CommunityPlaceModel extends Model<
  CommunityPlaceAttributes,
  CommunityPlaceCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => InstitutionModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare institutionId: string;

  @BelongsTo(() => InstitutionModel)
  declare institution?: InstitutionModel;

  @Column({ type: DataType.STRING(200), allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING(30), allowNull: false })
  declare type: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare description: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare address: string | null;

  @Column({ type: DataType.STRING(20), allowNull: true })
  declare contactPhone: string | null;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare contactEmail: string | null;
}
