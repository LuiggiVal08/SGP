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
  @HasMany(() => UserModel)
  declare users?: UserModel[];
}

// ── PnfModel ──
interface PnfAttributes {
  id: string;
  name: string;
  institutionId: string;
  coordinatorId: string | null;
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
  @BelongsTo(() => InstitutionModel)
  declare institution?: InstitutionModel;
  @Column({ type: DataType.UUID, allowNull: true })
  declare coordinatorId: string | null;
  @HasMany(() => UserModel)
  declare users?: UserModel[];
}

// ── SecurityQuestionsModel ──
interface QuestionAttributes {
  id: string;
  questionText: string;
  active: boolean;
}
type QuestionCreationAttributes = Optional<QuestionAttributes, 'id' | 'active'>;

@Table({ tableName: 'questions', timestamps: true })
class QuestionModel extends Model<
  QuestionAttributes,
  QuestionCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;
  @Column({ type: DataType.STRING(255), allowNull: false })
  declare questionText: string;
  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare active: boolean;
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
  @Column({ type: DataType.STRING(20), allowNull: true })
  declare phone: string | undefined;
  @ForeignKey(() => PnfModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare pnfId: string;
  @BelongsTo(() => PnfModel)
  declare pnf?: PnfModel;
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

// ── UserQuestionModel ──
interface UserQuestionAttributes {
  id: string;
  userId: string;
  questionId: string;
  answerHash: string;
}
type UserQuestionCreationAttributes = Optional<UserQuestionAttributes, 'id'>;

@Table({ tableName: 'user_questions', timestamps: true })
class UserQuestionModel extends Model<
  UserQuestionAttributes,
  UserQuestionCreationAttributes
> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;
  @ForeignKey(() => UserModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;
  @ForeignKey(() => QuestionModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare questionId: string;
  @Column({ type: DataType.STRING(255), allowNull: false })
  declare answerHash: string;
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
    models: [
      RoleModel,
      InstitutionModel,
      PnfModel,
      UserModel,
      QuestionModel,
      UserQuestionModel,
    ],
    logging: false,
  });

  await sequelize.authenticate();
  console.log('✅ Conectado a MySQL');

  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  await sequelize.query(
    `DROP TABLE IF EXISTS users, pnfs, institutions, roles, questions, user_questions`,
  );
  await sequelize.sync();
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('✅ Tablas recreadas');

  // ── 1. Roles ──
  const adminRole = await RoleModel.create({
    id: randomUUID(),
    name: 'ADMIN',
    description: 'Administrador del sistema',
  });
  await RoleModel.create({
    id: randomUUID(),
    name: 'IRCOP',
    description: 'Administrador suplente / Desarrollador',
  });
  const studentRole = await RoleModel.create({
    id: randomUUID(),
    name: 'STUDENT',
    description: 'Estudiante',
  });
  const docenteRole = await RoleModel.create({
    id: randomUUID(),
    name: 'DOCENTE',
    description: 'Docente',
  });
  console.log('✅ Roles creados');

  // ── 2. Institution (fixed UUID for stability across seed runs) ──
  const uppt = await InstitutionModel.create({
    id: 'b2000000-0000-4000-8000-000000000001',
    name: 'UPPT Mario Briceño Iragorry Nucleo Bocono',
    acronym: 'UPPT',
    email: 'uppt@edu.ve',
    contactInfo: 'Boconó, Venezuela',
  });
  console.log('✅ Institución creada');

  // ── 3. PNFs (fixed UUIDs for stability across seed runs) ──
  const ingInfo = await PnfModel.create({
    id: 'a1000000-0000-4000-8000-000000000001',
    name: 'Ingeniería Informática',
    institutionId: uppt.id,
  });
  const _admin = await PnfModel.create({
    id: 'a1000000-0000-4000-8000-000000000002',
    name: 'Administración',
    institutionId: uppt.id,
  });
  const contaduria = await PnfModel.create({
    id: 'a1000000-0000-4000-8000-000000000003',
    name: 'Contaduría',
    institutionId: uppt.id,
  });
  const _turismo = await PnfModel.create({
    id: 'a1000000-0000-4000-8000-000000000004',
    name: 'Turismo',
    institutionId: uppt.id,
  });
  const _psicologia = await PnfModel.create({
    id: 'a1000000-0000-4000-8000-000000000005',
    name: 'Psicología',
    institutionId: uppt.id,
  });
  console.log('✅ PNFs creadas');

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
    pnfId: ingInfo.id,
    institutionId: uppt.id,
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
    pnfId: ingInfo.id,
    institutionId: uppt.id,
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
    pnfId: contaduria.id,
    institutionId: uppt.id,
    roleId: docenteRole.id,
  });

  console.log('✅ Usuarios creados');
  // ── 5. Security Questions ──
  const questions = [
    '¿Cuál es el nombre de tu primera mascota?',
    '¿Cuál es el nombre de tu mejor amigo de la infancia?',
    '¿En qué ciudad naciste?',
    '¿Cuál es el nombre de tu profesor favorito?',
    '¿Cuál es tu comida favorita?',
    '¿Cuál es el nombre de tu película favorita?',
    '¿Cuál es el título de tu libro favorito?',
    '¿Cuál es tu deporte favorito?',
  ];

  for (const text of questions) {
    await QuestionModel.create({
      id: randomUUID(),
      questionText: text,
    });
  }
  console.log('✅ Preguntas de seguridad creadas');

  console.log('\n── Credenciales ──');
  console.log('admin@sgp.com / password123  (ADMIN)');
  console.log('carlos@sgp.com / password123  (STUDENT)');
  console.log('maria@sgp.com  / password123  (DOCENTE)');

  await sequelize.close();
  console.log('🔌 Conexión cerrada');
}

seed().catch((err) => {
  console.error('❌ Seed falló:', err);
  process.exit(1);
});
