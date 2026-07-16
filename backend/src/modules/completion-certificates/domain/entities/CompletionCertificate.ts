export class CompletionCertificate {
  constructor(
    public readonly id: string,
    public readonly authorId: string,
    public readonly issuedAt: Date,
    public readonly pdfUrl: string | null,
    public readonly code: string | null,
  ) {}
}
