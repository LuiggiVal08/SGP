import { Injectable, Logger } from '@nestjs/common';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { unlink, writeFile } from 'fs/promises';
import type { IFileStorageService } from '@share/domain/ports/IFileStorageService';

@Injectable()
export class LocalStorageService implements IFileStorageService {
  private readonly logger = new Logger(LocalStorageService.name);
  private readonly uploadDir = join(process.cwd(), 'uploads');

  async upload(
    buffer: Buffer,
    options: { originalName: string; mimeType: string; directory: string },
  ): Promise<{ key: string; url: string }> {
    const ext = extname(options.originalName);
    const filename = `${randomUUID()}${ext}`;
    const key = `${options.directory}/${filename}`;
    const dest = join(this.uploadDir, options.directory);

    if (!existsSync(dest)) mkdirSync(dest, { recursive: true });

    const fullPath = join(dest, filename);
    await writeFile(fullPath, buffer);

    return {
      key,
      url: `/uploads/${key}`,
    };
  }

  async delete(keyOrUrl: string): Promise<void> {
    const relativePath = keyOrUrl.replace(/^\/uploads\//, '');
    const fullPath = join(this.uploadDir, relativePath);
    try {
      await unlink(fullPath);
    } catch (error) {
      this.logger.error(`Failed to delete file "${fullPath}"`, error);
    }
  }
}
