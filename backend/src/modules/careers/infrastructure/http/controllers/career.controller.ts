import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { GetAllCareersUseCase } from '../../../application/use-cases/get-all-careers.use-case';
import { CreateCareerUseCase } from '../../../application/use-cases/create-career.use-case';
import { UpdateCareerUseCase } from '../../../application/use-cases/update-career.use-case';
import { CreateCareerDto } from '../dtos/create-career.dto';
import { UpdateCareerDto } from '../dtos/update-career.dto';

@Controller('careers')
export class CareerController {
  constructor(
    private readonly getAllCareersUseCase: GetAllCareersUseCase,
    private readonly createCareerUseCase: CreateCareerUseCase,
    private readonly updateCareerUseCase: UpdateCareerUseCase,
  ) {}

  @Get()
  async findAll() {
    return this.getAllCareersUseCase.execute();
  }

  @Post()
  async create(@Body() dto: CreateCareerDto) {
    return this.createCareerUseCase.execute(dto.name);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCareerDto) {
    return this.updateCareerUseCase.execute(id, dto.name);
  }
}
