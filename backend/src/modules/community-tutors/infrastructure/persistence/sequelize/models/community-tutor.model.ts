import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { CommunityPlaceModel } from '@modules/community-places/infrastructure/persistence/sequelize/models/community-place.model';

interface CommunityTutorAttributes {
  id: string;
  locationId: string;
  fullName: string | null;
  dni: string | null;
  phone: string | null;
  email: string | null;
  position: string | null;
}

type CommunityTutorCreationAttributes = Optional<
  CommunityTutorAttributes,
  'id' | 'fullName' | 'dni' | 'phone' | 'email' | 'position'
>;

@Table({ tableName: 'community_tutors', timestamps: true })
export class CommunityTutorModel extends Model<
  CommunityTutorAttributes,
  CommunityTutorCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @ForeignKey(() => CommunityPlaceModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare locationId: string;

  @BelongsTo(() => CommunityPlaceModel)
  declare location?: CommunityPlaceModel;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare fullName: string | null;

  @Column({ type: DataType.STRING(20), allowNull: true })
  declare dni: string | null;

  @Column({ type: DataType.STRING(20), allowNull: true })
  declare phone: string | null;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare email: string | null;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare position: string | null;
}
