export class CompletionCertificate {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly userId: string,
    public readonly pdfUrl: string,
    public readonly serialNumber: string,
    public readonly issuedAt: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly project?: {
      id: string;
      title: string;
      year: number;
      career?: { id: string; name: string };
      tutor?: { id: string; firstName: string; lastName: string };
    },
    public readonly user?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    },
  ) {}
}
