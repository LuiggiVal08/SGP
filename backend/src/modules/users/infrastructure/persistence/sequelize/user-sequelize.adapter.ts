import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, QueryTypes } from 'sequelize';
import { IUserRepository } from '../../../domain/ports/IUserRepository';
import { UserModel } from './models/user.model';
import { User } from '../../../domain/entities/User';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

@Injectable()
export class UserSequelizeAdapter implements IUserRepository {
  constructor(
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
  ) {}

  private toDomain(model: UserModel | null): User | null {
    if (!model) return null;
    return new User(
      model.id,
      model.dni,
      model.firstName,
      model.lastName,
      model.email,
      model.password,
      model.isActive,
      model.pnfId,
      model.institutionId,
      model.roleId,
      model.phone,
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

  async findByRoleId(roleId: string): Promise<User[]> {
    const users = await this.userModel.findAll({ where: { roleId } });
    return users.map(
      (u) =>
        new User(
          u.id,
          u.dni,
          u.firstName,
          u.lastName,
          u.email,
          u.password,
          u.isActive,
          u.pnfId,
          u.institutionId,
          u.roleId,
          u.phone,
        ),
    );
  }

  async findAll(): Promise<User[]> {
    const users = await this.userModel.findAll();
    return users.map(
      (u) =>
        new User(
          u.id,
          u.dni,
          u.firstName,
          u.lastName,
          u.email,
          u.password,
          u.isActive,
          u.pnfId,
          u.institutionId,
          u.roleId,
          u.phone,
        ),
    );
  }

  async findAllPaginated(
    dto: PaginationDto,
    role?: string,
  ): Promise<PaginatedResult<User>> {
    const page = dto.page ?? 1;
    const limit = Math.min(dto.limit ?? 10, 100);

    const where: Record<string | symbol, any> = {};
    if (dto.search) {
      const dniSearch = dto.search.replace(/\D/g, '');
      const orConditions: Record<string | symbol, any>[] = [];
      if (dniSearch) {
        orConditions.push({ dni: { [Op.like]: `%${dniSearch}%` } });
      }
      orConditions.push(
        { firstName: { [Op.like]: `%${dto.search}%` } },
        { lastName: { [Op.like]: `%${dto.search}%` } },
        { email: { [Op.like]: `%${dto.search}%` } },
      );
      where[Op.or] = orConditions;
    }
    if (role) {
      where.roleId = role;
    }
    const { rows, count } = await this.userModel.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['firstName', 'ASC']],
    });
    return {
      data: rows.map(
        (u) =>
          new User(
            u.id,
            u.dni,
            u.firstName,
            u.lastName,
            u.email,
            u.password,
            u.isActive,
            u.pnfId,
            u.institutionId,
            u.roleId,
            u.phone,
          ),
      ),
      meta: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    };
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
      pnfId: user.pnfId,
      institutionId: user.institutionId,
      roleId: user.roleId,
      phone: user.phone,
    });
  }

  async update(id: string, data: Partial<Omit<User, 'id'>>): Promise<void> {
    await this.userModel.update(data, { where: { id } });
  }

  async countByInstitutionId(institutionId: string): Promise<number> {
    return this.userModel.count({ where: { institutionId } });
  }

  async countByPnfId(pnfId: string): Promise<number> {
    return this.userModel.count({ where: { pnfId } });
  }

  async countByRoleName(roleName: string): Promise<number> {
    const [result] = await this.userModel.sequelize!.query(
      'SELECT COUNT(*) AS `count` FROM `users` u INNER JOIN `roles` r ON r.`id` = u.`roleId` WHERE r.`name` = ?',
      { replacements: [roleName], type: QueryTypes.SELECT },
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return (result as any).count;
  }

  async delete(id: string): Promise<void> {
    await this.userModel.destroy({ where: { id } });
  }
}
