import { IsString, IsUUID, IsInt, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTrajectoryDto {
  @ApiProperty({ example: 'b2000000-0000-4000-8000-000000000001' })
  @IsUUID()
  pnfId!: string;

  @ApiProperty({ example: 'Trayecto I' })
  @IsString()
  @Length(1, 100)
  name!: string;

  @ApiProperty({ example: 1, description: 'Orden del trayecto' })
  @IsInt()
  orderNumber!: number;
}
