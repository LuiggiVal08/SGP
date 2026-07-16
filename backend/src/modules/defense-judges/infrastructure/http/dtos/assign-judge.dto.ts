import { IsString, IsOptional, IsIn } from 'class-validator';
import { JudgeType } from '../../../domain/entities/DefenseJudge';

export class AssignJudgeDto {
  @IsIn(['DOCENTE', 'TUTOR_INSTITUCIONAL', 'TUTOR_COMUNITARIO'])
  judgeType!: JudgeType;

  @IsOptional()
  @IsString()
  professorId?: string;

  @IsOptional()
  @IsString()
  communityTutorId?: string;
}
