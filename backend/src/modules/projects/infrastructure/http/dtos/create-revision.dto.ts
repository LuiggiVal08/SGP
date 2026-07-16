import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRevisionDto {
  @ApiProperty({
    example: 'APPROVED',
    description: 'Estado después de la revisión',
  })
  @IsString()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED'])
  statusAfter!: string;

  @ApiProperty({
    example: 'El avance cumple con los objetivos del trimestre',
    description: 'Comentario de la revisión',
  })
  @IsString()
  comment!: string;
}
