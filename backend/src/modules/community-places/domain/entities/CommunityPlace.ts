export class CommunityPlace {
  constructor(
    public readonly id: string,
    public readonly institutionId: string,
    public readonly name: string,
    public readonly type: string,
    public readonly description: string | null,
    public readonly address: string | null,
    public readonly contactPhone: string | null,
    public readonly contactEmail: string | null,
  ) {}
}
