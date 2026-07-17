import { IsUUID } from 'class-validator';

export class AddProjectAuthorDto {
  @IsUUID()
  studentId!: string;
}
