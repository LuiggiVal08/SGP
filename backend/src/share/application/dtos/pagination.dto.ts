import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({ example: 1, description: 'Número de página', required: false })
  page?: number;

  @ApiProperty({
    example: 10,
    description: 'Elementos por página',
    required: false,
  })
  limit?: number;

  @ApiProperty({
    example: 'ingeniería',
    description: 'Término de búsqueda',
    required: false,
  })
  search?: string;

  @ApiProperty({ description: 'Filtrar por ID de PNF', required: false })
  pnfId?: string;

  @ApiProperty({ description: 'Filtrar por ID de tutor', required: false })
  tutorId?: string;

  @ApiProperty({
    description: 'Filtrar por estado del proyecto',
    required: false,
    enum: ['COMPLETED', 'PENDING_VALIDATION', 'REJECTED'],
  })
  status?: string;

  @ApiProperty({ description: 'Año desde', required: false })
  yearFrom?: number;

  @ApiProperty({ description: 'Año hasta', required: false })
  yearTo?: number;

  @ApiProperty({
    description: 'Filtrar por ID de autor del proyecto',
    required: false,
  })
  authorId?: string;

  @ApiProperty({
    description: 'Filtrar por metodología',
    required: false,
  })
  methodology?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
