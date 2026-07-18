export class UserSession {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly startAt: Date,
    public readonly active: boolean = true,
    public readonly device?: string | null,
    public readonly ip?: string | null,
    public readonly endAt?: Date | null,
  ) {}
}
