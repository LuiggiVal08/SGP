export class Professor {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly specialization?: string,
  ) {}
}
