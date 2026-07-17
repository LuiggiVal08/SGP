export class Period {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly isActive: boolean,
  ) {}
}
