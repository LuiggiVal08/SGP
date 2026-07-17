export interface IFileStorageService {
  upload(
    buffer: Buffer,
    options: {
      originalName: string;
      mimeType: string;
      directory: string;
    },
  ): Promise<{ key: string; url: string }>;

  delete(keyOrUrl: string): Promise<void>;
}
