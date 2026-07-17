import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const VALID_STATUSES = ['COMPLETED', 'PENDING_VALIDATION', 'REJECTED'] as const;

export class UpdateProjectStatusDto {
  @ApiProperty({
    enum: VALID_STATUSES,
    example: 'COMPLETED',
    description: 'Nuevo estado del proyecto',
  })
  @IsString()
  @IsIn(VALID_STATUSES)
  status!: string;
}
