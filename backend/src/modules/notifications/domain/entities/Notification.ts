export class Notification {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly title: string,
    public readonly message: string,
    public readonly type: string,
    public readonly read: boolean,
    public readonly relatedId: string | null,
    public readonly createdAt: Date,
  ) {}
}
