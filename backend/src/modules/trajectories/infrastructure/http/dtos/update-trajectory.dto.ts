import { IsOptional, IsString, IsUUID, IsInt, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTrajectoryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  pnfId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  orderNumber?: number;
}
