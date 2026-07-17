export class DefenseScheduleChange {
  constructor(
    public readonly id: string,
    public readonly defenseId: string,
    public readonly previousDate: Date | null,
    public readonly newDate: Date,
    public readonly changedBy: string,
    public readonly reason: string,
  ) {}
}
