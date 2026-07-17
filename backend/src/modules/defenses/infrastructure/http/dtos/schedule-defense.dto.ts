import { IsDateString, IsUUID } from 'class-validator';

export class ScheduleDefenseDto {
  @IsUUID()
  projectId!: string;

  @IsDateString()
  scheduledDate!: string;
}
