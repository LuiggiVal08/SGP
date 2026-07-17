export class Pnf {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly institutionId: string,
    public readonly coordinatorId?: string,
  ) {}
}
