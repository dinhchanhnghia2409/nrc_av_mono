import { Module } from '@nestjs/common';
import { DatabaseModule } from '../core';
import { SequenceController } from './sequence.controller';
import { SequenceService } from './sequence.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SequenceController],
  providers: [SequenceService],
})
export class SequenceModule {}
