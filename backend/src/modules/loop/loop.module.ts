import { Module } from '@nestjs/common';
import { LoopController } from './infrastructure/http/loop.controller';
import { LoopService } from './application/services/loop.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [LoopService],
  controllers: [LoopController],
  exports: [LoopService],
})
export class LoopModule {}
