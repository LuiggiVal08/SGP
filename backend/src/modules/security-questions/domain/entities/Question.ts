export class Question {
  constructor(
    public readonly id: string,
    public readonly questionText: string,
    public readonly active: boolean,
  ) {}
}
