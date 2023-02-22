import { forwardRef } from '@nestjs/common/utils';
import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentGateway } from './agent.gateway';
import { AgentService } from './agent.service';
import { CarModule } from '../car/car.module';
import { DatabaseModule } from '../core';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => CarModule), DatabaseModule, AuthModule],
  controllers: [AgentController],
  providers: [AgentService, AgentGateway],
})
export class AgentModule {}
