export class Student {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly trajectoryId: string,
    public readonly enrollmentNumber: string,
    public readonly cohort: number,
    public readonly currentTrayecto: number,
  ) {}
}
