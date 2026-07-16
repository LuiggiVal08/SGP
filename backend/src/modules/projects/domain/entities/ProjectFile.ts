export type DocumentType = 'RESUMEN' | 'TOMO';

export class ProjectFile {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly fileName: string,
    public readonly urlPath: string,
    public readonly documentType: DocumentType,
    public readonly uploadedBy: string,
    public readonly version: number,
    public readonly mimeType: string,
    public readonly size: number,
  ) {}
}
