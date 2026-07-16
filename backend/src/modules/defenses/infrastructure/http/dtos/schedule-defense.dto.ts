import { IsDateString } from 'class-validator';

export class ScheduleDefenseDto {
  @IsDateString()
  scheduledDate!: string;
}
