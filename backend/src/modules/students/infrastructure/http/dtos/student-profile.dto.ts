export class StudentProfileDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  dni: string;
  phone: string | null;
  trajectoryId: string;
  trajectoryName: string;
  enrollmentNumber: string;
  cohort: number;
  currentTrayecto: number;
  subjects: { id: string; name: string }[];
}
