import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import {
  GetUsersUseCase,
  UserWithRole,
} from '../../../application/use-cases/get-users.use-case';
import { CreateUserUseCase } from '../../../application/use-cases/create-user.use-case';
import { CreateUserDto } from '../dtos/create-user.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}

  @Get()
  async findAll(@Query('role') role?: string): Promise<UserWithRole[]> {
    return this.getUsersUseCase.execute(role);
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.createUserUseCase.execute(dto);
  }
}
