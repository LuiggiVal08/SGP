import { IsString, IsIn, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const VALID_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;

export class UpdateMilestoneStatusDto {
  @ApiProperty({
    enum: VALID_STATUSES,
    example: 'APPROVED',
    description: 'Nuevo estado del hito',
  })
  @IsString()
  @IsIn(VALID_STATUSES)
  status!: string;

  @ApiPropertyOptional({
    example: 'Avance satisfactorio, continuar con el siguiente trimestre',
    description: 'Comentario de la revision (opcional)',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
