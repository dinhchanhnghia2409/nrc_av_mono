import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../core';
import { ModelController } from './model.controller';
import { ModelService } from './model.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [ModelController],
  providers: [ModelService]
})
export class ModelModule {}
