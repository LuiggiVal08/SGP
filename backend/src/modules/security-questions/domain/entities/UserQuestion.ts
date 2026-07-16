export class UserQuestion {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly questionId: string,
    public readonly answerHash: string,
  ) {}
}
