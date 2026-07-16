import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateProjectCorrectionDto {
  @ApiProperty({ description: 'ID del archivo TOMO' })
  @IsUUID()
  fileId: string;

  @ApiProperty({ description: 'Comentario de la corrección', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}
