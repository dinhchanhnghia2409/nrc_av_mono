import { Module } from '@nestjs/common';
import { forwardRef } from '@nestjs/common/utils';
import { AgentModule } from '../agent/agent.module';
import { DatabaseModule } from '../core/database/database.module';
import { CarController } from './car.controller';
import { CarService } from './car.service';
import { CarGateway } from './car.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => AgentModule), AuthModule],
  controllers: [CarController],
  providers: [CarService, CarGateway],
  exports: [CarService, CarGateway],
})
export class CarModule {}
