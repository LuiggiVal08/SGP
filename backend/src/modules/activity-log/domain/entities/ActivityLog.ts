export class ActivityLog {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly action: string,
    public readonly entityType: string,
    public readonly entityId: string | null,
    public readonly description: string | null,
    public readonly details: Record<string, any> | null,
    public readonly createdAt: string,
    public readonly user?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    },
  ) {}
}
