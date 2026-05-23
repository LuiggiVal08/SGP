// src/modules/users/domain/entities/User.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly dni: string,
    public readonly username: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly isActive: boolean = true,
  ) {}
}
