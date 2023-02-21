import { forwardRef } from '@nestjs/common/utils';
import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentGateway } from './agent.gateway';
import { AgentService } from './agent.service';
import { CarModule } from '../car/car.module';
import { DatabaseModule } from '../core';

@Module({
  imports: [forwardRef(() => CarModule), DatabaseModule],
  controllers: [AgentController],
  providers: [AgentService, AgentGateway],
})
export class AgentModule {}
