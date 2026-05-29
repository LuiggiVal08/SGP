export class User {
  constructor(
    public readonly id: string,
    public readonly dni: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly password: string,
    public readonly isActive: boolean = true,
    public readonly careerId: string,
    public readonly institutionId: string,
    public readonly roleId: string,
  ) {}
}
