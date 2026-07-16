import { Module } from '@nestjs/common';
import { LoopController } from './infrastructure/http/loop.controller';
import { LoopService } from './application/services/loop.service';

@Module({
  providers: [LoopService],
  controllers: [LoopController],
  exports: [LoopService],
})
export class LoopModule {}
