import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class RescheduleDefenseDto {
  @IsDateString()
  scheduledDate!: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsUUID()
  changedBy?: string;
}
