# Plan: Backend Modules Implementation

## Overview

Build 6 modules following strict hexagonal architecture:
- **New**: roles, institutions, careers, projects, auth
- **Modify**: users (existing)

All code in English, camelCase TS fields → snake_case DB columns.

---

## Phase 1 — Domain Entities + Ports

### 1.1 `src/modules/roles/domain/entities/Role.ts`
```ts
export class Role {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
  ) {}
}
```

### 1.2 `src/modules/roles/domain/ports/IRoleRepository.ts`
```ts
import { Role } from '../entities/Role';

export interface IRoleRepository {
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  save(role: Role): Promise<void>;
}
```

### 1.3 `src/modules/institutions/domain/entities/Institution.ts`
```ts
export class Institution {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly acronym: string,
    public readonly email: string,
    public readonly contactInfo: string,
  ) {}
}
```

### 1.4 `src/modules/institutions/domain/ports/IInstitutionRepository.ts`
```ts
import { Institution } from '../entities/Institution';

export interface IInstitutionRepository {
  findById(id: string): Promise<Institution | null>;
  findAll(): Promise<Institution[]>;
  save(institution: Institution): Promise<void>;
}
```

### 1.5 `src/modules/careers/domain/entities/Career.ts`
```ts
export class Career {
  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {}
}
```

### 1.6 `src/modules/careers/domain/ports/ICareerRepository.ts`
```ts
import { Career } from '../entities/Career';

export interface ICareerRepository {
  findById(id: string): Promise<Career | null>;
  findAll(): Promise<Career[]>;
  save(career: Career): Promise<void>;
}
```

### 1.7 `src/modules/projects/domain/entities/Project.ts`
```ts
export type ProjectStatus = 'COMPLETED' | 'PENDING_VALIDATION' | 'REJECTED';

export class Project {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly year: number,
    public readonly status: ProjectStatus,
    public readonly careerId: string,
    public readonly tutorId: string,
  ) {}
}
```

### 1.8 `src/modules/projects/domain/entities/ProjectFile.ts`
```ts
export type FileType = 'THESIS_PDF' | 'SOURCE_CODE' | 'BUSINESS_PLAN';

export class ProjectFile {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly fileName: string,
    public readonly urlPath: string,
    public readonly fileType: FileType,
  ) {}
}
```

### 1.9 `src/modules/projects/domain/ports/IProjectRepository.ts`
```ts
import { Project, ProjectStatus } from '../entities/Project';
import { ProjectFile, FileType } from '../entities/ProjectFile';

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  findAll(): Promise<Project[]>;
  findByStatus(status: ProjectStatus): Promise<Project[]>;
  findByCareer(careerId: string): Promise<Project[]>;
  findByTutor(tutorId: string): Promise<Project[]>;
  save(project: Project, authorIds: string[]): Promise<Project>;
  saveFiles(files: ProjectFile[]): Promise<ProjectFile[]>;
  delete(id: string): Promise<void>;
}
```

### 1.10 `src/modules/auth/domain/ports/ITokenService.ts`
```ts
export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

export interface ITokenService {
  generate(payload: TokenPayload): string;
  verify(token: string): TokenPayload;
}
```

### 1.11 `src/modules/auth/domain/ports/IHashService.ts`
```ts
export interface IHashService {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}
```

### 1.12 `src/modules/auth/domain/ports/ILoginUseCase.ts`
```ts
export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  accessToken: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

export interface ILoginUseCase {
  execute(input: LoginInput): Promise<LoginOutput>;
}
```

### 1.13 MODIFY `src/modules/users/domain/entities/User.ts`
Remove `username`. Rename `passwordHash` → `password`. Add `careerId`, `institutionId`, `roleId`:
```ts
export class User {
  constructor(
    public readonly id: string,
    public readonly dni: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly password: string,
    public readonly isActive: boolean = true,
    public readonly careerId: string,
    public readonly institutionId: string,
    public readonly roleId: string,
  ) {}
}
```

### 1.14 MODIFY `src/modules/users/domain/ports/IUserRepository.ts`
Remove `findByUsername`. Add `findById`, `findAll`:
```ts
import { User } from '../entities/User';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByDni(dni: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  save(user: User): Promise<void>;
}
```

---

## Phase 2 — Sequelize Models (persistence)

### 2.1 `src/modules/roles/infrastructure/persistence/role.model.ts`
```ts
import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { UserModel } from '@modules/users/infrastructure/persistence/user.model';

interface RoleAttributes {
  id: string;
  name: string;
  description: string;
}

type RoleCreationAttributes = Optional<RoleAttributes, 'id'>;

@Table({ tableName: 'roles', timestamps: true })
export class RoleModel extends Model<RoleAttributes, RoleCreationAttributes> {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING(20), unique: true, allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare description: string;

  @HasMany(() => UserModel)
  declare users?: UserModel[];
}
```

### 2.2 `src/modules/institutions/infrastructure/persistence/institution.model.ts`
```ts
import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { UserModel } from '@modules/users/infrastructure/persistence/user.model';

interface InstitutionAttributes {
  id: string;
  name: string;
  acronym: string;
  email: string;
  contactInfo: string;
}

type InstitutionCreationAttributes = Optional<InstitutionAttributes, 'id'>;

@Table({ tableName: 'institutions', timestamps: true })
export class InstitutionModel extends Model<InstitutionAttributes, InstitutionCreationAttributes> {
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
```

### 2.3 `src/modules/careers/infrastructure/persistence/career.model.ts`
```ts
import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { UserModel } from '@modules/users/infrastructure/persistence/user.model';
import { ProjectModel } from '@modules/projects/infrastructure/persistence/project.model';

interface CareerAttributes {
  id: string;
  name: string;
}

type CareerCreationAttributes = Optional<CareerAttributes, 'id'>;

@Table({ tableName: 'careers', timestamps: true })
export class CareerModel extends Model<CareerAttributes, CareerCreationAttributes> {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare name: string;

  @HasMany(() => UserModel)
  declare users?: UserModel[];

  @HasMany(() => ProjectModel)
  declare projects?: ProjectModel[];
}
```

### 2.4 MODIFY `src/modules/users/infrastructure/persistence/user.model.ts`
Remove `username` column. Add FK columns + `@BelongsTo` decorators:
```ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { RoleModel } from '@modules/roles/infrastructure/persistence/role.model';
import { CareerModel } from '@modules/careers/infrastructure/persistence/career.model';
import { InstitutionModel } from '@modules/institutions/infrastructure/persistence/institution.model';

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
export class UserModel extends Model<UserAttributes, UserCreationAttributes> {
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
```

### 2.5 `src/modules/projects/infrastructure/persistence/project.model.ts`
```ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo, BelongsToMany, HasMany } from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { CareerModel } from '@modules/careers/infrastructure/persistence/career.model';
import { UserModel } from '@modules/users/infrastructure/persistence/user.model';
import { ProjectFileModel } from './project-file.model';
import { ProjectAuthorModel } from './project-author.model';

interface ProjectAttributes {
  id: string;
  title: string;
  year: number;
  status: string;
  careerId: string;
  tutorId: string;
}

type ProjectCreationAttributes = Optional<ProjectAttributes, 'id' | 'status'>;

@Table({ tableName: 'projects', timestamps: true })
export class ProjectModel extends Model<ProjectAttributes, ProjectCreationAttributes> {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare title: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare year: number;

  @Column({ type: DataType.STRING(30), defaultValue: 'PENDING_VALIDATION' })
  declare status: string;

  @ForeignKey(() => CareerModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare careerId: string;

  @BelongsTo(() => CareerModel)
  declare career?: CareerModel;

  @ForeignKey(() => UserModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare tutorId: string;

  @BelongsTo(() => UserModel, 'tutorId')
  declare tutor?: UserModel;

  @BelongsToMany(() => UserModel, () => ProjectAuthorModel)
  declare authors?: UserModel[];

  @HasMany(() => ProjectFileModel)
  declare files?: ProjectFileModel[];
}
```

### 2.6 `src/modules/projects/infrastructure/persistence/project-file.model.ts`
```ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { ProjectModel } from './project.model';

interface ProjectFileAttributes {
  id: string;
  projectId: string;
  fileName: string;
  urlPath: string;
  fileType: string;
}

type ProjectFileCreationAttributes = Optional<ProjectFileAttributes, 'id'>;

@Table({ tableName: 'project_files', timestamps: true })
export class ProjectFileModel extends Model<ProjectFileAttributes, ProjectFileCreationAttributes> {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  declare id: string;

  @ForeignKey(() => ProjectModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare projectId: string;

  @BelongsTo(() => ProjectModel)
  declare project?: ProjectModel;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare fileName: string;

  @Column({ type: DataType.STRING(500), allowNull: false })
  declare urlPath: string;

  @Column({ type: DataType.STRING(30), allowNull: false })
  declare fileType: string;
}
```

### 2.7 `src/modules/projects/infrastructure/persistence/project-author.model.ts`
```ts
import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { ProjectModel } from './project.model';
import { UserModel } from '@modules/users/infrastructure/persistence/user.model';

@Table({ tableName: 'project_authors', timestamps: false })
export class ProjectAuthorModel extends Model {
  @ForeignKey(() => ProjectModel)
  @Column({ type: DataType.UUID, allowNull: false, primaryKey: true })
  declare projectId: string;

  @ForeignKey(() => UserModel)
  @Column({ type: DataType.UUID, allowNull: false, primaryKey: true })
  declare userId: string;
}
```

---

## Phase 3 — Adapters (Repository Implementations)

### 3.1 `src/modules/roles/infrastructure/adapters/role-sequelize.adapter.ts`
```ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { IRoleRepository } from '../../domain/ports/IRoleRepository';
import { RoleModel } from '../persistence/role.model';
import { Role } from '../../domain/entities/Role';

@Injectable()
export class RoleSequelizeAdapter implements IRoleRepository {
  constructor(
    @InjectModel(RoleModel)
    private readonly roleModel: typeof RoleModel,
  ) {}

  private toDomain(model: RoleModel | null): Role | null {
    if (!model) return null;
    return new Role(model.id, model.name, model.description);
  }

  async findById(id: string): Promise<Role | null> {
    const role = await this.roleModel.findByPk(id);
    return this.toDomain(role);
  }

  async findByName(name: string): Promise<Role | null> {
    const role = await this.roleModel.findOne({ where: { name } });
    return this.toDomain(role);
  }

  async findAll(): Promise<Role[]> {
    const roles = await this.roleModel.findAll();
    return roles.map((r) => new Role(r.id, r.name, r.description));
  }

  async save(role: Role): Promise<void> {
    await this.roleModel.upsert({
      id: role.id,
      name: role.name,
      description: role.description,
    });
  }
}
```

### 3.2 `src/modules/institutions/infrastructure/adapters/institution-sequelize.adapter.ts`
```ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { IInstitutionRepository } from '../../domain/ports/IInstitutionRepository';
import { InstitutionModel } from '../persistence/institution.model';
import { Institution } from '../../domain/entities/Institution';

@Injectable()
export class InstitutionSequelizeAdapter implements IInstitutionRepository {
  constructor(
    @InjectModel(InstitutionModel)
    private readonly institutionModel: typeof InstitutionModel,
  ) {}

  private toDomain(model: InstitutionModel | null): Institution | null {
    if (!model) return null;
    return new Institution(model.id, model.name, model.acronym, model.email, model.contactInfo);
  }

  async findById(id: string): Promise<Institution | null> {
    const inst = await this.institutionModel.findByPk(id);
    return this.toDomain(inst);
  }

  async findAll(): Promise<Institution[]> {
    const insts = await this.institutionModel.findAll();
    return insts.map((i) => new Institution(i.id, i.name, i.acronym, i.email, i.contactInfo));
  }

  async save(institution: Institution): Promise<void> {
    await this.institutionModel.upsert({
      id: institution.id,
      name: institution.name,
      acronym: institution.acronym,
      email: institution.email,
      contactInfo: institution.contactInfo,
    });
  }
}
```

### 3.3 `src/modules/careers/infrastructure/adapters/career-sequelize.adapter.ts`
```ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ICareerRepository } from '../../domain/ports/ICareerRepository';
import { CareerModel } from '../persistence/career.model';
import { Career } from '../../domain/entities/Career';

@Injectable()
export class CareerSequelizeAdapter implements ICareerRepository {
  constructor(
    @InjectModel(CareerModel)
    private readonly careerModel: typeof CareerModel,
  ) {}

  private toDomain(model: CareerModel | null): Career | null {
    if (!model) return null;
    return new Career(model.id, model.name);
  }

  async findById(id: string): Promise<Career | null> {
    const career = await this.careerModel.findByPk(id);
    return this.toDomain(career);
  }

  async findAll(): Promise<Career[]> {
    const careers = await this.careerModel.findAll();
    return careers.map((c) => new Career(c.id, c.name));
  }

  async save(career: Career): Promise<void> {
    await this.careerModel.upsert({
      id: career.id,
      name: career.name,
    });
  }
}
```

### 3.4 MODIFY `src/modules/users/infrastructure/adapters/user-sequelize.adapter.ts`
Update `toDomain` and `save` to match new User entity fields. Remove `findByUsername`. Add `findById`, `findAll`:
```ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { IUserRepository } from '../../domain/ports/IUserRepository';
import { UserModel } from '../persistence/user.model';
import { User } from '../../domain/entities/User';

@Injectable()
export class UserSequelizeAdapter implements IUserRepository {
  constructor(
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
  ) {}

  private toDomain(model: UserModel | null): User | null {
    if (!model) return null;
    return new User(
      model.id, model.dni, model.firstName, model.lastName,
      model.email, model.password, model.isActive,
      model.careerId, model.institutionId, model.roleId,
    );
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findByPk(id);
    return this.toDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ where: { email } });
    return this.toDomain(user);
  }

  async findByDni(dni: string): Promise<User | null> {
    const user = await this.userModel.findOne({ where: { dni } });
    return this.toDomain(user);
  }

  async findAll(): Promise<User[]> {
    const users = await this.userModel.findAll();
    return users.map((u) => new User(
      u.id, u.dni, u.firstName, u.lastName,
      u.email, u.password, u.isActive,
      u.careerId, u.institutionId, u.roleId,
    ));
  }

  async save(user: User): Promise<void> {
    await this.userModel.upsert({
      id: user.id,
      dni: user.dni,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      isActive: user.isActive,
      careerId: user.careerId,
      institutionId: user.institutionId,
      roleId: user.roleId,
    });
  }
}
```

### 3.5 `src/modules/projects/infrastructure/adapters/project-sequelize.adapter.ts`
```ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { Project, ProjectStatus } from '../../domain/entities/Project';
import { ProjectFile, FileType } from '../../domain/entities/ProjectFile';
import { ProjectModel } from '../persistence/project.model';
import { ProjectFileModel } from '../persistence/project-file.model';
import { ProjectAuthorModel } from '../persistence/project-author.model';
import { UserModel } from '@modules/users/infrastructure/persistence/user.model';
import { CareerModel } from '@modules/careers/infrastructure/persistence/career.model';

@Injectable()
export class ProjectSequelizeAdapter implements IProjectRepository {
  constructor(
    @InjectModel(ProjectModel)
    private readonly projectModel: typeof ProjectModel,
    @InjectModel(ProjectFileModel)
    private readonly projectFileModel: typeof ProjectFileModel,
    @InjectModel(ProjectAuthorModel)
    private readonly projectAuthorModel: typeof ProjectAuthorModel,
    private readonly sequelize: Sequelize,
  ) {}

  private toDomain(model: ProjectModel): Project {
    return new Project(
      model.id, model.title, model.year,
      model.status as ProjectStatus,
      model.careerId, model.tutorId,
    );
  }

  async findById(id: string): Promise<Project | null> {
    const project = await this.projectModel.findByPk(id, {
      include: [UserModel, CareerModel, ProjectFileModel],
    });
    return project ? this.toDomain(project) : null;
  }

  async findAll(): Promise<Project[]> {
    const projects = await this.projectModel.findAll({
      include: [
        { model: UserModel, as: 'authors' },
        { model: UserModel, as: 'tutor' },
        CareerModel,
        ProjectFileModel,
      ],
    });
    return projects.map((p) => this.toDomain(p));
  }

  async findByStatus(status: ProjectStatus): Promise<Project[]> {
    const projects = await this.projectModel.findAll({ where: { status } });
    return projects.map((p) => this.toDomain(p));
  }

  async findByCareer(careerId: string): Promise<Project[]> {
    const projects = await this.projectModel.findAll({ where: { careerId } });
    return projects.map((p) => this.toDomain(p));
  }

  async findByTutor(tutorId: string): Promise<Project[]> {
    const projects = await this.projectModel.findAll({ where: { tutorId } });
    return projects.map((p) => this.toDomain(p));
  }

  async save(project: Project, authorIds: string[]): Promise<Project> {
    const transaction = await this.sequelize.transaction();
    try {
      const [created] = await this.projectModel.upsert({
        id: project.id,
        title: project.title,
        year: project.year,
        status: project.status,
        careerId: project.careerId,
        tutorId: project.tutorId,
      }, { transaction });

      const authorRecords = authorIds.map((userId) => ({
        projectId: created.id,
        userId,
      }));
      await this.projectAuthorModel.bulkCreate(authorRecords, { transaction });

      await transaction.commit();
      return this.toDomain(created);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async saveFiles(files: ProjectFile[]): Promise<ProjectFile[]> {
    const records = files.map((f) => ({
      id: f.id,
      projectId: f.projectId,
      fileName: f.fileName,
      urlPath: f.urlPath,
      fileType: f.fileType,
    }));
    const created = await this.projectFileModel.bulkCreate(records);
    return created.map((c) => new ProjectFile(c.id, c.projectId, c.fileName, c.urlPath, c.fileType as FileType));
  }

  async delete(id: string): Promise<void> {
    await this.projectModel.destroy({ where: { id } });
  }
}
```

---

## Phase 4 — Use Cases + Controllers

### 4.1 `src/modules/auth/infrastructure/adapters/jwt-token.adapter.ts`
```ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenService, TokenPayload } from '../../domain/ports/ITokenService';

@Injectable()
export class JwtTokenAdapter implements ITokenService {
  constructor(private readonly jwtService: JwtService) {}

  generate(payload: TokenPayload): string {
    return this.jwtService.sign(payload);
  }

  verify(token: string): TokenPayload {
    return this.jwtService.verify<TokenPayload>(token);
  }
}
```

### 4.2 `src/modules/auth/infrastructure/adapters/bcrypt-hash.adapter.ts`
```ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IHashService } from '../../domain/ports/IHashService';

@Injectable()
export class BcryptHashAdapter implements IHashService {
  private readonly saltRounds = 10;

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
```

### 4.3 `src/modules/auth/infrastructure/adapters/login-use-case.ts`
```ts
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { ILoginUseCase, LoginInput, LoginOutput } from '../../domain/ports/ILoginUseCase';
import { IUserRepository } from '@modules/users/domain/ports/IUserRepository';
import { IHashService } from '../../domain/ports/IHashService';
import { ITokenService } from '../../domain/ports/ITokenService';
import { IRoleRepository } from '@modules/roles/domain/ports/IRoleRepository';

@Injectable()
export class LoginUseCase implements ILoginUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IHashService')
    private readonly hashService: IHashService,
    @Inject('ITokenService')
    private readonly tokenService: ITokenService,
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.hashService.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const role = await this.roleRepository.findById(user.roleId);
    const roleName = role?.name ?? 'STUDENT';

    const accessToken = this.tokenService.generate({
      sub: user.id,
      email: user.email,
      role: roleName,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: roleName,
      },
    };
  }
}
```

### 4.4 `src/modules/auth/infrastructure/dtos/login.dto.ts`
```ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
```

### 4.5 `src/modules/auth/infrastructure/adapters/auth.controller.ts`
```ts
import { Controller, Post, Body, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { ILoginUseCase } from '../../domain/ports/ILoginUseCase';
import { LoginDto } from '../dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('ILoginUseCase')
    private readonly loginUseCase: ILoginUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute({ email: dto.email, password: dto.password });
  }
}
```

### 4.6 `src/modules/projects/infrastructure/adapters/create-project.use-case.ts`
```ts
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { ICareerRepository } from '@modules/careers/domain/ports/ICareerRepository';
import { IUserRepository } from '@modules/users/domain/ports/IUserRepository';
import { Project } from '../../domain/entities/Project';
import { v4 as uuidv4 } from 'uuid';

interface CreateProjectInput {
  title: string;
  year: number;
  careerId: string;
  authorIds: string[];
  tutorId: string;
}

@Injectable()
export class CreateProjectUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('ICareerRepository')
    private readonly careerRepository: ICareerRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: CreateProjectInput) {
    if (input.authorIds.length > 3) {
      throw new BadRequestException('Maximum 3 authors per project');
    }

    const career = await this.careerRepository.findById(input.careerId);
    if (!career) {
      throw new BadRequestException('Career not found');
    }

    const tutor = await this.userRepository.findById(input.tutorId);
    if (!tutor) {
      throw new BadRequestException('Tutor not found');
    }

    for (const authorId of input.authorIds) {
      const author = await this.userRepository.findById(authorId);
      if (!author) {
        throw new BadRequestException(`Author with id ${authorId} not found`);
      }
    }

    const project = new Project(
      uuidv4(),
      input.title,
      input.year,
      'PENDING_VALIDATION',
      input.careerId,
      input.tutorId,
    );

    return this.projectRepository.save(project, input.authorIds);
  }
}
```

### 4.7 `src/modules/projects/infrastructure/adapters/upload-project-files.use-case.ts`
```ts
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';
import { ProjectFile, FileType } from '../../domain/entities/ProjectFile';
import { v4 as uuidv4 } from 'uuid';

interface UploadFilesInput {
  projectId: string;
  files: Array<{
    fileName: string;
    urlPath: string;
    fileType: FileType;
  }>;
}

@Injectable()
export class UploadProjectFilesUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(input: UploadFilesInput) {
    const project = await this.projectRepository.findById(input.projectId);
    if (!project) {
      throw new BadRequestException('Project not found');
    }

    const validTypes: FileType[] = ['THESIS_PDF', 'SOURCE_CODE', 'BUSINESS_PLAN'];
    for (const file of input.files) {
      if (!validTypes.includes(file.fileType)) {
        throw new BadRequestException(`Invalid file type: ${file.fileType}`);
      }
    }

    const projectFiles = input.files.map(
      (f) => new ProjectFile(uuidv4(), input.projectId, f.fileName, f.urlPath, f.fileType),
    );

    return this.projectRepository.saveFiles(projectFiles);
  }
}
```

### 4.8 `src/modules/projects/infrastructure/adapters/get-all-projects.use-case.ts`
```ts
import { Injectable, Inject } from '@nestjs/common';
import { IProjectRepository } from '../../domain/ports/IProjectRepository';

@Injectable()
export class GetAllProjectsUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute() {
    return this.projectRepository.findAll();
  }
}
```

### 4.9 `src/modules/projects/infrastructure/dtos/create-project.dto.ts`
```ts
import { IsString, IsNumber, IsUUID, IsArray, ArrayMaxSize, ArrayMinSize } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  title!: string;

  @IsNumber()
  year!: number;

  @IsUUID()
  careerId!: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  authorIds!: string[];

  @IsUUID()
  tutorId!: string;
}
```

### 4.10 `src/modules/projects/infrastructure/dtos/upload-files.dto.ts`
```ts
import { IsString, IsUUID, IsArray, IsEnum, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class FileItemDto {
  @IsString()
  fileName!: string;

  @IsString()
  urlPath!: string;

  @IsEnum(['THESIS_PDF', 'SOURCE_CODE', 'BUSINESS_PLAN'])
  fileType!: string;
}

export class UploadFilesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => FileItemDto)
  files!: FileItemDto[];
}
```

### 4.11 `src/modules/projects/infrastructure/adapters/project.controller.ts`
```ts
import { Controller, Get, Post, Body, Param, Inject } from '@nestjs/common';
import { CreateProjectUseCase } from './create-project.use-case';
import { UploadProjectFilesUseCase } from './upload-project-files.use-case';
import { GetAllProjectsUseCase } from './get-all-projects.use-case';
import { CreateProjectDto } from '../dtos/create-project.dto';
import { UploadFilesDto } from '../dtos/upload-files.dto';

@Controller('projects')
export class ProjectController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly uploadProjectFilesUseCase: UploadProjectFilesUseCase,
    private readonly getAllProjectsUseCase: GetAllProjectsUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateProjectDto) {
    return this.createProjectUseCase.execute({
      title: dto.title,
      year: dto.year,
      careerId: dto.careerId,
      authorIds: dto.authorIds,
      tutorId: dto.tutorId,
    });
  }

  @Post(':id/files')
  async uploadFiles(@Param('id') id: string, @Body() dto: UploadFilesDto) {
    return this.uploadProjectFilesUseCase.execute({
      projectId: id,
      files: dto.files,
    });
  }

  @Get()
  async findAll() {
    return this.getAllProjectsUseCase.execute();
  }
}
```

---

## Phase 5 — NestJS Modules + Wiring

### 5.1 `src/modules/roles/roles.module.ts`
```ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RoleModel } from './infrastructure/persistence/role.model';
import { RoleSequelizeAdapter } from './infrastructure/adapters/role-sequelize.adapter';

@Module({
  imports: [SequelizeModule.forFeature([RoleModel])],
  providers: [
    { provide: 'IRoleRepository', useClass: RoleSequelizeAdapter },
  ],
  exports: ['IRoleRepository'],
})
export class RolesModule {}
```

### 5.2 `src/modules/institutions/institutions.module.ts`
```ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { InstitutionModel } from './infrastructure/persistence/institution.model';
import { InstitutionSequelizeAdapter } from './infrastructure/adapters/institution-sequelize.adapter';

@Module({
  imports: [SequelizeModule.forFeature([InstitutionModel])],
  providers: [
    { provide: 'IInstitutionRepository', useClass: InstitutionSequelizeAdapter },
  ],
  exports: ['IInstitutionRepository'],
})
export class InstitutionsModule {}
```

### 5.3 `src/modules/careers/careers.module.ts`
```ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CareerModel } from './infrastructure/persistence/career.model';
import { CareerSequelizeAdapter } from './infrastructure/adapters/career-sequelize.adapter';

@Module({
  imports: [SequelizeModule.forFeature([CareerModel])],
  providers: [
    { provide: 'ICareerRepository', useClass: CareerSequelizeAdapter },
  ],
  exports: ['ICareerRepository'],
})
export class CareersModule {}
```

### 5.4 MODIFY `src/modules/users/users.module.ts`
```ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModel } from './infrastructure/persistence/user.model';
import { UserSequelizeAdapter } from './infrastructure/adapters/user-sequelize.adapter';

@Module({
  imports: [
    SequelizeModule.forFeature([UserModel]),
  ],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: UserSequelizeAdapter,
    },
  ],
  exports: ['IUserRepository'],
})
export class UsersModule {}
```

### 5.5 `src/modules/projects/projects.module.ts`
```ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProjectModel } from './infrastructure/persistence/project.model';
import { ProjectFileModel } from './infrastructure/persistence/project-file.model';
import { ProjectAuthorModel } from './infrastructure/persistence/project-author.model';
import { ProjectSequelizeAdapter } from './infrastructure/adapters/project-sequelize.adapter';
import { CreateProjectUseCase } from './infrastructure/adapters/create-project.use-case';
import { UploadProjectFilesUseCase } from './infrastructure/adapters/upload-project-files.use-case';
import { GetAllProjectsUseCase } from './infrastructure/adapters/get-all-projects.use-case';
import { ProjectController } from './infrastructure/adapters/project.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([ProjectModel, ProjectFileModel, ProjectAuthorModel]),
  ],
  providers: [
    { provide: 'IProjectRepository', useClass: ProjectSequelizeAdapter },
    CreateProjectUseCase,
    UploadProjectFilesUseCase,
    GetAllProjectsUseCase,
  ],
  controllers: [ProjectController],
})
export class ProjectsModule {}
```

### 5.6 `src/modules/auth/auth.module.ts`
```ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { env } from '@config/env.config';
import { UsersModule } from '@modules/users/users.module';
import { RolesModule } from '@modules/roles/roles.module';
import { JwtTokenAdapter } from './infrastructure/adapters/jwt-token.adapter';
import { BcryptHashAdapter } from './infrastructure/adapters/bcrypt-hash.adapter';
import { LoginUseCase } from './infrastructure/adapters/login-use-case';
import { AuthController } from './infrastructure/adapters/auth.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: env.JWT_EXPIRES_IN },
    }),
    UsersModule,
    RolesModule,
  ],
  providers: [
    { provide: 'ITokenService', useClass: JwtTokenAdapter },
    { provide: 'IHashService', useClass: BcryptHashAdapter },
    { provide: 'ILoginUseCase', useClass: LoginUseCase },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
```

### 5.7 MODIFY `src/modules/index.ts`
```ts
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { InstitutionsModule } from './institutions/institutions.module';
import { CareersModule } from './careers/careers.module';
import { ProjectsModule } from './projects/projects.module';
import { AuthModule } from './auth/auth.module';

const modules = [
  UsersModule, RolesModule, InstitutionsModule,
  CareersModule, ProjectsModule, AuthModule,
];
export default modules;
```

### 5.8 MODIFY `src/config/env.config.ts`
Add JWT env vars:
```ts
export const envValidationSchema = z.object({
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1),
  PORT: z.coerce.number().default(3000),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('1h'),
});
```

---

## Phase 6 — Tests

### 6.1 `src/modules/auth/infrastructure/adapters/login-use-case.spec.ts`
```ts
import { Test } from '@nestjs/testing';
import { LoginUseCase } from './login-use-case';
import { IUserRepository } from '../../../domain/ports/IUserRepository';
import { IHashService } from '../../../domain/ports/IHashService';
import { ITokenService } from '../../../domain/ports/ITokenService';
import { IRoleRepository } from '../../../../roles/domain/ports/IRoleRepository';
import { User } from '../../../../users/domain/entities/User';
import { Role } from '../../../../roles/domain/entities/Role';
import { UnauthorizedException } from '@nestjs/common';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let hashService: jest.Mocked<IHashService>;
  let tokenService: jest.Mocked<ITokenService>;
  let roleRepository: jest.Mocked<IRoleRepository>;

  const mockUser = new User(
    'uuid-1', '12345678', 'John', 'Doe',
    'john@test.com', 'hashed-pwd', true,
    'career-uuid', 'inst-uuid', 'role-uuid',
  );
  const mockRole = new Role('role-uuid', 'STUDENT', 'Student role');

  beforeEach(async () => {
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByDni: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
    };
    hashService = { hash: jest.fn(), compare: jest.fn() };
    tokenService = { generate: jest.fn(), verify: jest.fn() };
    roleRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
    };

    useCase = new LoginUseCase(userRepository, hashService, tokenService, roleRepository);
  });

  it('should return token and user on valid credentials', async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser);
    hashService.compare.mockResolvedValue(true);
    roleRepository.findById.mockResolvedValue(mockRole);
    tokenService.generate.mockReturnValue('jwt-token');

    const result = await useCase.execute({ email: 'john@test.com', password: 'password123' });

    expect(result.accessToken).toBe('jwt-token');
    expect(result.user.email).toBe('john@test.com');
    expect(result.user.role).toBe('STUDENT');
  });

  it('should throw UnauthorizedException when email not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'unknown@test.com', password: 'password123' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when password is invalid', async () => {
    userRepository.findByEmail.mockResolvedValue(mockUser);
    hashService.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'john@test.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
```

### 6.2 `src/modules/projects/infrastructure/adapters/create-project.use-case.spec.ts`
```ts
import { CreateProjectUseCase } from './create-project.use-case';
import { IProjectRepository } from '../../../domain/ports/IProjectRepository';
import { ICareerRepository } from '../../../../careers/domain/ports/ICareerRepository';
import { IUserRepository } from '../../../../users/domain/ports/IUserRepository';
import { Career } from '../../../../careers/domain/entities/Career';
import { User } from '../../../../users/domain/entities/User';
import { BadRequestException } from '@nestjs/common';

describe('CreateProjectUseCase', () => {
  let useCase: CreateProjectUseCase;
  let projectRepository: jest.Mocked<IProjectRepository>;
  let careerRepository: jest.Mocked<ICareerRepository>;
  let userRepository: jest.Mocked<IUserRepository>;

  const mockCareer = new Career('career-uuid', 'Engineering');
  const mockTutor = new User(
    'tutor-uuid', '11111111', 'Prof', 'Smith',
    'smith@test.com', 'hash', true, 'career-uuid', 'inst-uuid', 'role-uuid',
  );

  beforeEach(() => {
    projectRepository = {
      findById: jest.fn(), findAll: jest.fn(),
      findByStatus: jest.fn(), findByCareer: jest.fn(), findByTutor: jest.fn(),
      save: jest.fn(), saveFiles: jest.fn(), delete: jest.fn(),
    };
    careerRepository = { findById: jest.fn(), findAll: jest.fn(), save: jest.fn() };
    userRepository = {
      findById: jest.fn(), findByEmail: jest.fn(),
      findByDni: jest.fn(), findAll: jest.fn(), save: jest.fn(),
    };

    useCase = new CreateProjectUseCase(projectRepository, careerRepository, userRepository);
  });

  it('should create project with valid data', async () => {
    careerRepository.findById.mockResolvedValue(mockCareer);
    userRepository.findById.mockImplementation((id) => {
      if (id === 'tutor-uuid') return Promise.resolve(mockTutor);
      if (id === 'author-1') return Promise.resolve(
        new User('author-1', '22222222', 'Student', 'A', 'a@test.com', 'hash', true, 'career-uuid', 'inst-uuid', 'role-uuid'),
      );
      return Promise.resolve(null);
    });
    projectRepository.save.mockResolvedValue(undefined as any);

    const result = await useCase.execute({
      title: 'My Project', year: 2025, careerId: 'career-uuid',
      authorIds: ['author-1'], tutorId: 'tutor-uuid',
    });

    expect(projectRepository.save).toHaveBeenCalled();
    expect(projectRepository.save.mock.calls[0][1]).toEqual(['author-1']);
  });

  it('should reject more than 3 authors', async () => {
    await expect(
      useCase.execute({
        title: 'Overload', year: 2025, careerId: 'career-uuid',
        authorIds: ['a', 'b', 'c', 'd'], tutorId: 'tutor-uuid',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
```

### 6.3 MODIFY `test/jest-e2e.json` — Add moduleNameMapper
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "moduleNameMapper": {
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@share/(.*)$": "<rootDir>/src/share/$1",
    "^@modules/(.*)$": "<rootDir>/src/modules/$1"
  }
}
```

### 6.4 MODIFY `backend/package.json` jest config — Add moduleNameMapper
```json
"moduleNameMapper": {
  "^@config/(.*)$": "<rootDir>/config/$1",
  "^@share/(.*)$": "<rootDir>/share/$1",
  "^@modules/(.*)$": "<rootDir>/modules/$1"
}
```

### 6.5 `test/auth.e2e-spec.ts`
```ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login should return 400 for invalid payload', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'not-an-email', password: '12' })
      .expect(400);
  });

  it('POST /auth/login should return 401 for invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nonexistent@test.com', password: 'password123' })
      .expect(401);
  });
});
```

---

## Phase 7 — Dependencies

### MODIFY `backend/package.json`
Add to `dependencies`:
```json
"@nestjs/jwt": "^11.0.1",
"bcryptjs": "^2.4.3",
"class-validator": "^0.14.1",
"class-transformer": "^0.5.1"
```

Add to `devDependencies`:
```json
"@types/bcryptjs": "^2.4.6"
```

After modifying, rebuild the container:
```bash
docker compose up -d --build sgp_api_backend
```

---

## File Summary

### New files (~32)
1. `src/modules/roles/domain/entities/Role.ts`
2. `src/modules/roles/domain/ports/IRoleRepository.ts`
3. `src/modules/roles/infrastructure/persistence/role.model.ts`
4. `src/modules/roles/infrastructure/adapters/role-sequelize.adapter.ts`
5. `src/modules/roles/roles.module.ts`
6. `src/modules/institutions/domain/entities/Institution.ts`
7. `src/modules/institutions/domain/ports/IInstitutionRepository.ts`
8. `src/modules/institutions/infrastructure/persistence/institution.model.ts`
9. `src/modules/institutions/infrastructure/adapters/institution-sequelize.adapter.ts`
10. `src/modules/institutions/institutions.module.ts`
11. `src/modules/careers/domain/entities/Career.ts`
12. `src/modules/careers/domain/ports/ICareerRepository.ts`
13. `src/modules/careers/infrastructure/persistence/career.model.ts`
14. `src/modules/careers/infrastructure/adapters/career-sequelize.adapter.ts`
15. `src/modules/careers/careers.module.ts`
16. `src/modules/projects/domain/entities/Project.ts`
17. `src/modules/projects/domain/entities/ProjectFile.ts`
18. `src/modules/projects/domain/ports/IProjectRepository.ts`
19. `src/modules/projects/infrastructure/persistence/project.model.ts`
20. `src/modules/projects/infrastructure/persistence/project-file.model.ts`
21. `src/modules/projects/infrastructure/persistence/project-author.model.ts`
22. `src/modules/projects/infrastructure/adapters/project-sequelize.adapter.ts`
23. `src/modules/projects/infrastructure/adapters/create-project.use-case.ts`
24. `src/modules/projects/infrastructure/adapters/upload-project-files.use-case.ts`
25. `src/modules/projects/infrastructure/adapters/get-all-projects.use-case.ts`
26. `src/modules/projects/infrastructure/dtos/create-project.dto.ts`
27. `src/modules/projects/infrastructure/dtos/upload-files.dto.ts`
28. `src/modules/projects/infrastructure/adapters/project.controller.ts`
29. `src/modules/projects/projects.module.ts`
30. `src/modules/auth/domain/ports/ITokenService.ts`
31. `src/modules/auth/domain/ports/IHashService.ts`
32. `src/modules/auth/domain/ports/ILoginUseCase.ts`
33. `src/modules/auth/infrastructure/adapters/jwt-token.adapter.ts`
34. `src/modules/auth/infrastructure/adapters/bcrypt-hash.adapter.ts`
35. `src/modules/auth/infrastructure/adapters/login-use-case.ts`
36. `src/modules/auth/infrastructure/dtos/login.dto.ts`
37. `src/modules/auth/infrastructure/adapters/auth.controller.ts`
38. `src/modules/auth/auth.module.ts`
39. `src/modules/auth/infrastructure/adapters/login-use-case.spec.ts`
40. `src/modules/projects/infrastructure/adapters/create-project.use-case.spec.ts`
41. `test/auth.e2e-spec.ts`

### Modified files (8)
1. `src/modules/users/domain/entities/User.ts`
2. `src/modules/users/domain/ports/IUserRepository.ts`
3. `src/modules/users/infrastructure/persistence/user.model.ts`
4. `src/modules/users/infrastructure/adapters/user-sequelize.adapter.ts`
5. `src/modules/users/users.module.ts` — (only if UserModel attributes changed)
6. `src/modules/index.ts`
7. `src/config/env.config.ts`
8. `backend/package.json`
9. `test/jest-e2e.json`
