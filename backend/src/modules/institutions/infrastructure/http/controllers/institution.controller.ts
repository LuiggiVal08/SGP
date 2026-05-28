import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { GetAllInstitutionsUseCase } from '../../../application/use-cases/get-all-institutions.use-case';
import { CreateInstitutionUseCase } from '../../../application/use-cases/create-institution.use-case';
import { UpdateInstitutionUseCase } from '../../../application/use-cases/update-institution.use-case';
import { CreateInstitutionDto } from '../dtos/create-institution.dto';
import { UpdateInstitutionDto } from '../dtos/update-institution.dto';

@Controller('institutions')
export class InstitutionController {
  constructor(
    private readonly getAllInstitutionsUseCase: GetAllInstitutionsUseCase,
    private readonly createInstitutionUseCase: CreateInstitutionUseCase,
    private readonly updateInstitutionUseCase: UpdateInstitutionUseCase,
  ) {}

  @Get()
  async findAll() {
    return this.getAllInstitutionsUseCase.execute();
  }

  @Post()
  async create(@Body() dto: CreateInstitutionDto) {
    return this.createInstitutionUseCase.execute(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateInstitutionDto) {
    return this.updateInstitutionUseCase.execute(id, dto);
  }
}
