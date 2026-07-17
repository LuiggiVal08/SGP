import { IsString, IsUUID, Length, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePnfDto {
  @ApiProperty({
    example: 'Ingeniería en Sistemas',
    description: 'Nombre de la PNF',
  })
  @IsString()
  @Length(1, 100)
  name!: string;

  @ApiProperty({
    example: 'b2000000-0000-4000-8000-000000000001',
    description: 'ID de la institución a la que pertenece la PNF',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  institutionId?: string;

  @ApiProperty({
    example: 'c2000000-0000-4000-8000-000000000001',
    description: 'ID del profesor coordinador del PNF',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  coordinatorId?: string;
}
