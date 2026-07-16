import { IsString, IsOptional, IsUUID, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommunityTutorDto {
  @ApiProperty({ example: 'b2000000-0000-4000-8000-000000000001' })
  @IsUUID()
  locationId!: string;

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
