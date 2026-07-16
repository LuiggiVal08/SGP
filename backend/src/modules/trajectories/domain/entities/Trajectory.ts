export class Trajectory {
  constructor(
    public readonly id: string,
    public readonly pnfId: string,
    public readonly name: string,
    public readonly orderNumber: number,
  ) {}
}
