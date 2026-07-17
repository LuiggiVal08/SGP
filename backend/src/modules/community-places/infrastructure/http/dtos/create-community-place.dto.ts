import { IsString, IsOptional, IsUUID, IsIn, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommunityPlaceDto {
  @ApiProperty({ example: 'b2000000-0000-4000-8000-000000000001' })
  @IsUUID()
  institutionId!: string;

  @ApiProperty({ example: 'Consejo Comunal El Carmen' })
  @IsString()
  @Length(1, 200)
  name!: string;

  @ApiProperty({
    example: 'COMMUNITY',
    description: 'COMMUNITY | ORGANIZATION | INSTITUTION | COMPANY',
  })
  @IsIn(['COMMUNITY', 'ORGANIZATION', 'INSTITUTION', 'COMPANY'])
  type!: string;

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
