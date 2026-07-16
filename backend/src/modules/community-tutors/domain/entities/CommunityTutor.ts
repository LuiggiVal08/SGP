export class CommunityTutor {
  constructor(
    public readonly id: string,
    public readonly locationId: string,
    public readonly fullName: string | null,
    public readonly dni: string | null,
    public readonly phone: string | null,
    public readonly email: string | null,
    public readonly position: string | null,
  ) {}
}
