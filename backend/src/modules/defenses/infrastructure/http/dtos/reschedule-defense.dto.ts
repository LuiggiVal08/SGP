import { IsDateString } from 'class-validator';

export class RescheduleDefenseDto {
  @IsDateString()
  scheduledDate!: string;
}
