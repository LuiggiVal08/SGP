import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { env } from '@config/env.config';
import type { IFileStorageService } from '@share/domain/ports/IFileStorageService';

@Injectable()
export class MinioStorageService implements IFileStorageService, OnModuleInit {
  private readonly logger = new Logger(MinioStorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const endpoint = env.MINIO_ENDPOINT;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const port = env.MINIO_PORT;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.bucket = env.MINIO_BUCKET;

    this.client = new S3Client({
      endpoint: `http://${endpoint}:${port}`,
      region: 'us-east-1',
      credentials: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        accessKeyId: env.MINIO_ACCESS_KEY,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        secretAccessKey: env.MINIO_SECRET_KEY,
      },
      forcePathStyle: true,
    });
  }

  async onModuleInit() {
    await this.ensureBucket();
  }

  private async ensureBucket() {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`Bucket "${this.bucket}" already exists`);
    } catch {
      this.logger.log(`Creating bucket "${this.bucket}"...`);
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`Bucket "${this.bucket}" created`);
    }

    await this.setPublicReadPolicy();
  }

  private async setPublicReadPolicy() {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucket}/*`],
        },
      ],
    };

    try {
      await this.client.send(
        new PutBucketPolicyCommand({
          Bucket: this.bucket,
          Policy: JSON.stringify(policy),
        }),
      );
      this.logger.log(`Public read policy set on bucket "${this.bucket}"`);
    } catch (error) {
      this.logger.error(`Failed to set bucket policy`, error);
    }
  }

  async upload(
    buffer: Buffer,
    options: { originalName: string; mimeType: string; directory: string },
  ): Promise<{ key: string; url: string }> {
    const ext = extname(options.originalName);
    const filename = `${randomUUID()}${ext}`;
    const key = `${options.directory}/${filename}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: options.mimeType,
      }),
    );

    return {
      key,
      url: `/api/uploads/${key}`,
    };
  }

  async delete(keyOrUrl: string): Promise<void> {
    const key = keyOrUrl.replace(/^\/api\/uploads\//, '');
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      this.logger.error(`Failed to delete file "${key}" from MinIO`, error);
    }
  }
}
