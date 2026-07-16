export class Notification {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly title: string,
    public readonly message: string,
    public readonly type: string,
    public readonly entityType: string | null,
    public readonly entityId: string | null,
    public readonly readAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  get isRead(): boolean {
    return this.readAt !== null;
  }
}
