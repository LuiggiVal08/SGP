import {
  IsArray,
  IsDateString,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ScheduleDefenseJudgeDto {
  @IsString()
  judgeType!: 'SUBJECT_PROFESSOR' | 'ACADEMIC_TUTOR' | 'COMMUNITY_TUTOR';

  @IsUUID()
  professorId!: string;

  @IsUUID()
  communityTutorId!: string;
}

export class ScheduleDefenseDto {
  @IsUUID()
  projectId!: string;

  @IsDateString()
  scheduledDate!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleDefenseJudgeDto)
  judges!: ScheduleDefenseJudgeDto[];
}
