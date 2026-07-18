export class Permission {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
  ) {}

  public update(name?: string, description?: string): Permission {
    return new Permission(
      this.id,
      name ?? this.name,
      description !== undefined ? description : this.description,
    );
  }
}
