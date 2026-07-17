export class DefenseEvaluation {
  constructor(
    public readonly id: string,
    public readonly judgeId: string,
    public readonly score: number,
    public readonly comments: string,
  ) {}
}
