export class ProfessorProfileDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  dni: string;
  phone: string | null;
  specialization: string | null;
  subjects: { id: string; name: string; trajectoryName: string }[];
}
