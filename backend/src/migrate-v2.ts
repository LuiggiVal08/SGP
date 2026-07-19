import { Sequelize } from 'sequelize-typescript';
import { randomUUID } from 'crypto';
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import type { Optional } from 'sequelize';

const DB_HOST = process.env.DB_HOST ?? 'localhost';
const DB_PORT = Number(process.env.DB_PORT ?? 3306);
const DB_USER = process.env.DB_USER ?? 'root';
const DB_PASSWORD = process.env.DB_PASSWORD ?? 'root_password';
const DB_NAME = process.env.DB_NAME ?? 'sgp_dev';

// ── RoleModel ──
interface RoleAttributes {
  id: string;
  name: string;
  description: string;
}
type RoleCreationAttributes = Optional<RoleAttributes, 'id'>;
@Table({ tableName: 'roles', timestamps: true })
class RoleModel extends Model<RoleAttributes, RoleCreationAttributes> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;
  @Column({ type: DataType.STRING(20), unique: true, allowNull: false })
  declare name: string;
  @Column({ type: DataType.STRING(255), allowNull: true })
  declare description: string;
}

// ── ProjectModel ──
interface ProjectAttributes {
  id: string;
  title: string;
  year: number;
  status: string;
  pnfId: string;
  tutorId: string;
}
type ProjectCreationAttributes = Optional<ProjectAttributes, 'id' | 'status'>;
@Table({ tableName: 'projects', timestamps: true })
class ProjectModel extends Model<ProjectAttributes, ProjectCreationAttributes> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;
  @Column({ type: DataType.STRING(255), allowNull: false })
  declare title: string;
  @Column({ type: DataType.INTEGER, allowNull: false }) declare year: number;
  @Column({ type: DataType.STRING(30), defaultValue: 'PENDING_VALIDATION' })
  declare status: string;
  @ForeignKey(() => PnfModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare pnfId: string;
  @ForeignKey(() => UserModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare tutorId: string;
}

// ── PnfModel ──
interface PnfAttributes {
  id: string;
  name: string;
  institutionId: string;
}
type PnfCreationAttributes = Optional<PnfAttributes, 'id'>;
@Table({ tableName: 'pnfs', timestamps: true })
class PnfModel extends Model<PnfAttributes, PnfCreationAttributes> {
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
}

// ── InstitutionModel ──
interface InstitutionAttributes {
  id: string;
  name: string;
  acronym: string;
  email: string;
  contactInfo: string;
}
type InstitutionCreationAttributes = Optional<InstitutionAttributes, 'id'>;
@Table({ tableName: 'institutions', timestamps: true })
class InstitutionModel extends Model<
  InstitutionAttributes,
  InstitutionCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;
  @Column({ type: DataType.STRING(100), allowNull: false })
  declare name: string;
  @Column({ type: DataType.STRING(20), allowNull: true })
  declare acronym: string;
  @Column({ type: DataType.STRING(100), allowNull: true })
  declare email: string;
  @Column({ type: DataType.STRING(255), allowNull: true })
  declare contactInfo: string;
}

// ── UserModel ──
interface UserAttributes {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isActive: boolean;
  pnfId: string;
  institutionId: string;
  roleId: string;
  phone?: string;
}
type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | 'isActive' | 'phone'
>;
@Table({ tableName: 'users', timestamps: true })
class UserModel extends Model<UserAttributes, UserCreationAttributes> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;
  @Column({ type: DataType.STRING(20), unique: true, allowNull: false })
  declare dni: string;
  @Column({ type: DataType.STRING(50), allowNull: false })
  declare firstName: string;
  @Column({ type: DataType.STRING(50), allowNull: false })
  declare lastName: string;
  @Column({ type: DataType.STRING(100), unique: true, allowNull: false })
  declare email: string;
  @Column({ type: DataType.STRING(255), allowNull: false })
  declare password: string;
  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare isActive: boolean;
  @Column({ type: DataType.STRING(20), allowNull: true }) declare phone:
    string | undefined;
  @ForeignKey(() => PnfModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare pnfId: string;
  @ForeignKey(() => InstitutionModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare institutionId: string;
  @ForeignKey(() => RoleModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare roleId: string;
}

// ── ProjectMilestoneModel ──
type MilestoneType = 'TRIMESTRE' | 'DEFENSA';
type MilestoneStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
interface ProjectMilestoneAttributes {
  id: string;
  projectId: string;
  type: MilestoneType;
  trimestre: number | null;
  status: MilestoneStatus;
  approvedBy: string | null;
  approvedAt: Date | null;
}
type ProjectMilestoneCreationAttributes = Optional<
  ProjectMilestoneAttributes,
  'id' | 'status' | 'approvedBy' | 'approvedAt'
>;
@Table({ tableName: 'project_milestones', timestamps: true })
class ProjectMilestoneModel extends Model<
  ProjectMilestoneAttributes,
  ProjectMilestoneCreationAttributes
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
  @Column({ type: DataType.STRING(20), allowNull: false })
  declare type: MilestoneType;
  @Column({ type: DataType.INTEGER, allowNull: true }) declare trimestre:
    number | null;
  @Column({ type: DataType.STRING(20), defaultValue: 'PENDING' })
  declare status: MilestoneStatus;
  @Column({ type: DataType.UUID, allowNull: true }) declare approvedBy:
    string | null;
  @Column({ type: DataType.DATE, allowNull: true })
  declare approvedAt: Date | null;
}

async function migrate() {
  const sequelize = new Sequelize({
    dialect: 'mysql',
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    models: [
      RoleModel,
      InstitutionModel,
      PnfModel,
      UserModel,
      ProjectModel,
      ProjectMilestoneModel,
    ],
    logging: false,
  });

  await sequelize.authenticate();
  console.log('✅ Conectado a MySQL');

  // 1. Rename TUTOR -> DOCENTE in roles table
  const [updated] = await RoleModel.update(
    { name: 'DOCENTE', description: 'Docente' },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    { where: { name: 'TUTOR' } as any },
  );
  console.log(`✅ Roles renombrados: TUTOR → DOCENTE (${updated} filas)`);

  // 2. Create milestones for existing projects that don't have them
  const projects = await ProjectModel.findAll();
  let milestoneCount = 0;

  for (const project of projects) {
    const existing = await ProjectMilestoneModel.count({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: { projectId: project.id } as any,
    });
    if (existing > 0) continue;

    for (let t = 1; t <= 3; t++) {
      await ProjectMilestoneModel.create({
        id: randomUUID(),
        projectId: project.id,
        type: 'TRIMESTRE' as MilestoneType,
        trimestre: t,
        status: 'PENDING' as MilestoneStatus,
      });
      milestoneCount++;
    }
    await ProjectMilestoneModel.create({
      id: randomUUID(),
      projectId: project.id,
      type: 'DEFENSA' as MilestoneType,
      trimestre: null,
      status: 'PENDING' as MilestoneStatus,
    });
    milestoneCount++;
    console.log(`  → Milestones creados para proyecto ${project.id}`);
  }

  console.log(`✅ Milestones creados: ${milestoneCount}`);
  console.log('\n✅ Migración completada');

  await sequelize.close();
}

migrate().catch((err) => {
  console.error('❌ Migración falló:', err);
  process.exit(1);
});
