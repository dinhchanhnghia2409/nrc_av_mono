import { Module } from '@nestjs/common';
import { DatabaseModule } from '../core';
import { AuthModule } from '../auth/auth.module';
import { ModelController } from './model.controller';
import { ModelService } from './model.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [ModelController],
  providers: [ModelService],
})
export class ModelModule {}
