export class CompletionCertificate {
  constructor(
    public readonly id: string,
    public readonly authorId: string,
    public readonly pdfUrl: string,
    public readonly serialNumber: string,
    public readonly issuedAt: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
