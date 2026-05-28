import { Sequelize } from 'sequelize-typescript';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

// ── Env ────────────────────────────────────────────────
const DB_HOST = process.env.DB_HOST ?? 'localhost';
const DB_PORT = Number(process.env.DB_PORT ?? 3306);
const DB_USER = process.env.DB_USER ?? 'root';
const DB_PASSWORD = process.env.DB_PASSWORD ?? 'root_password';
const DB_NAME = process.env.DB_NAME ?? 'sgp_dev';

// ── Modelos inline (evita dependencia de path aliases) ──
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
import type { Optional } from 'sequelize';

// ── RoleModel ──
interface RoleAttributes {
  id: string;
  name: string;
  description: string;
}
type RoleCreationAttributes = Optional<RoleAttributes, 'id'>;

@Table({ tableName: 'roles', timestamps: true })
class RoleModel extends Model<RoleAttributes, RoleCreationAttributes> {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;
  @Column({ type: DataType.STRING(20), unique: true, allowNull: false })
  declare name: string;
  @Column({ type: DataType.STRING(255), allowNull: true })
  declare description: string;
  @HasMany(() => UserModel)
  declare users?: UserModel[];
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
class InstitutionModel extends Model<InstitutionAttributes, InstitutionCreationAttributes> {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;
  @Column({ type: DataType.STRING(100), allowNull: false })
  declare name: string;
  @Column({ type: DataType.STRING(20), allowNull: true })
  declare acronym: string;
  @Column({ type: DataType.STRING(100), allowNull: true })
  declare email: string;
  @Column({ type: DataType.STRING(255), allowNull: true })
  declare contactInfo: string;
  @HasMany(() => UserModel)
  declare users?: UserModel[];
}

// ── CareerModel ──
interface CareerAttributes {
  id: string;
  name: string;
}
type CareerCreationAttributes = Optional<CareerAttributes, 'id'>;

@Table({ tableName: 'careers', timestamps: true })
class CareerModel extends Model<CareerAttributes, CareerCreationAttributes> {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;
  @Column({ type: DataType.STRING(100), allowNull: false })
  declare name: string;
  @HasMany(() => UserModel)
  declare users?: UserModel[];
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
  careerId: string;
  institutionId: string;
  roleId: string;
}
type UserCreationAttributes = Optional<UserAttributes, 'id' | 'isActive'>;

@Table({ tableName: 'users', timestamps: true })
class UserModel extends Model<UserAttributes, UserCreationAttributes> {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
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
  @ForeignKey(() => CareerModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare careerId: string;
  @BelongsTo(() => CareerModel)
  declare career?: CareerModel;
  @ForeignKey(() => InstitutionModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare institutionId: string;
  @BelongsTo(() => InstitutionModel)
  declare institution?: InstitutionModel;
  @ForeignKey(() => RoleModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare roleId: string;
  @BelongsTo(() => RoleModel)
  declare role?: RoleModel;
}

// ── Main ───────────────────────────────────────────────
async function seed() {
  const sequelize = new Sequelize({
    dialect: 'mysql',
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    models: [RoleModel, InstitutionModel, CareerModel, UserModel],
    logging: false,
  });

  await sequelize.authenticate();
  console.log('✅ Conectado a MySQL');

  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  await sequelize.query(`DROP TABLE IF EXISTS project_authors, project_files, projects, users, careers, institutions, roles`);
  await sequelize.sync();
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('✅ Tablas recreadas');

  // ── 1. Roles ──
  const adminRole = await RoleModel.create({
    id: randomUUID(),
    name: 'ADMIN',
    description: 'Administrador del sistema',
  });
  const studentRole = await RoleModel.create({
    id: randomUUID(),
    name: 'STUDENT',
    description: 'Estudiante',
  });
  const tutorRole = await RoleModel.create({
    id: randomUUID(),
    name: 'TUTOR',
    description: 'Tutor / Docente',
  });
  console.log('✅ Roles creados');

  // ── 2. Institutions ──
  const una = await InstitutionModel.create({
    id: randomUUID(),
    name: 'Universidad Nacional de Asunción',
    acronym: 'UNA',
    email: 'contacto@una.py',
    contactInfo: 'San Lorenzo, Paraguay',
  });
  const uni = await InstitutionModel.create({
    id: randomUUID(),
    name: 'Universidad Católica Nuestra Señora de la Asunción',
    acronym: 'UC',
    email: 'info@uc.edu.py',
    contactInfo: 'Asunción, Paraguay',
  });
  console.log('✅ Instituciones creadas');

  // ── 3. Careers ──
  const ingInfo = await CareerModel.create({
    id: randomUUID(),
    name: 'Ingeniería Informática',
  });
  const ingCivil = await CareerModel.create({
    id: randomUUID(),
    name: 'Ingeniería Civil',
  });
  const medicina = await CareerModel.create({
    id: randomUUID(),
    name: 'Medicina',
  });
  console.log('✅ Carreras creadas');

  // ── 4. Users ──
  const password = await bcrypt.hash('password123', 10);

  await UserModel.create({
    id: randomUUID(),
    dni: '0000000-1',
    firstName: 'Admin',
    lastName: 'Sistema',
    email: 'admin@sgp.com',
    password,
    isActive: true,
    careerId: ingInfo.id,
    institutionId: una.id,
    roleId: adminRole.id,
  });

  await UserModel.create({
    id: randomUUID(),
    dni: '1234567-8',
    firstName: 'Carlos',
    lastName: 'López',
    email: 'carlos@sgp.com',
    password,
    isActive: true,
    careerId: ingInfo.id,
    institutionId: una.id,
    roleId: studentRole.id,
  });

  await UserModel.create({
    id: randomUUID(),
    dni: '8765432-1',
    firstName: 'María',
    lastName: 'González',
    email: 'maria@sgp.com',
    password,
    isActive: true,
    careerId: medicina.id,
    institutionId: uni.id,
    roleId: tutorRole.id,
  });

  console.log('✅ Usuarios creados');
  console.log('\n── Credenciales ──');
  console.log('admin@sgp.com / password123  (ADMIN)');
  console.log('carlos@sgp.com / password123  (STUDENT)');
  console.log('maria@sgp.com  / password123  (TUTOR)');

  await sequelize.close();
  console.log('🔌 Conexión cerrada');
}

seed().catch((err) => {
  console.error('❌ Seed falló:', err);
  process.exit(1);
});
