import { IsString, IsOptional, IsUUID, IsIn, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommunityPlaceDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  institutionId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  name?: string;

  @ApiProperty({
    required: false,
    description: 'COMMUNITY | ORGANIZATION | INSTITUTION | COMPANY',
  })
  @IsOptional()
  @IsIn(['COMMUNITY', 'ORGANIZATION', 'INSTITUTION', 'COMPANY'])
  type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  contactPhone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  contactEmail?: string;
}
