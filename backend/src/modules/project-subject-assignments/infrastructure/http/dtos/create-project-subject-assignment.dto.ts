import { IsUUID } from 'class-validator';

export class CreateProjectSubjectAssignmentDto {
  @IsUUID()
  subjectId!: string;

  @IsUUID()
  professorId!: string;

  @IsUUID()
  periodId!: string;
}
