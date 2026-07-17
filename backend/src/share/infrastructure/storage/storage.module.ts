import { Module, Global, Logger } from '@nestjs/common';
import { env } from '@config/env.config';
import { MinioStorageService } from './minio-storage.service';
import { LocalStorageService } from './local-storage.service';

@Global()
@Module({
  providers: [
    {
      provide: 'IFileStorageService',
      useFactory: () => {
        const logger = new Logger('StorageModule');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const driver = env.STORAGE_DRIVER;
        logger.log(`Using storage driver: ${driver}`);

        if (driver === 'minio') {
          return new MinioStorageService();
        }
        return new LocalStorageService();
      },
    },
  ],
  exports: ['IFileStorageService'],
})
export class StorageModule {}
