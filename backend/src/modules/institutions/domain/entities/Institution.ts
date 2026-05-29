export class Institution {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly acronym: string,
    public readonly email: string,
    public readonly contactInfo: string,
  ) {}
}
