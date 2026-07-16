import { IsString, IsNumber, IsObject, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDefensaDto {
  @ApiProperty({
    example: 'Prof. Marielis Gonzales',
    description: 'Juez docente',
  })
  @IsString()
  juezDocente!: string;

  @ApiProperty({
    example: 'Yenklin Morante',
    description: 'Tutor institucional',
  })
  @IsString()
  juezTutorInstitucional!: string;

  @ApiProperty({
    example: 'Msc. Carisna Camacho',
    description: 'Tutor comunitario',
  })
  @IsString()
  juezTutorComunitario!: string;

  @ApiProperty({ example: 18.5, description: 'Nota grupal de la defensa' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(20)
  notaGrupal!: number;

  @ApiProperty({
    example: { 'uuid-estudiante-1': 18.5, 'uuid-estudiante-2': 19.0 },
    description: 'Notas individuales por estudiante (userId: nota)',
  })
  @IsObject()
  notasIndividuales!: Record<string, number>;
}
