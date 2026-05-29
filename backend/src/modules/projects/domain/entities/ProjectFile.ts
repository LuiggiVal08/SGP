export type FileType = 'THESIS_PDF' | 'SOURCE_CODE' | 'BUSINESS_PLAN';

export class ProjectFile {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly fileName: string,
    public readonly urlPath: string,
    public readonly fileType: FileType,
  ) {}
}
