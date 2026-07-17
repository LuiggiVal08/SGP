import { IsString, IsOptional, IsIn } from 'class-validator';
import { JudgeType } from '../../../domain/entities/DefenseJudge';

const VALID_JUDGE_TYPES: JudgeType[] = [
  'SUBJECT_PROFESSOR',
  'ACADEMIC_TUTOR',
  'COMMUNITY_TUTOR',
];

export class AssignJudgeDto {
  @IsIn(VALID_JUDGE_TYPES)
  judgeType!: JudgeType;

  @IsOptional()
  @IsString()
  professorId?: string;

  @IsOptional()
  @IsString()
  communityTutorId?: string;
}
