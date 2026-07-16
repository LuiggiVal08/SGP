import { IsString, IsOptional, IsUUID, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommunityTutorDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  fullName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  dni?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  position?: string;
}
