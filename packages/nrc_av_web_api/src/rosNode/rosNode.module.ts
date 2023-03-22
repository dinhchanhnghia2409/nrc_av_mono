import { Module } from '@nestjs/common';
import { forwardRef } from '@nestjs/common/utils';
import { AgentModule } from '../agent/agent.module';
import { VehicleModule } from '../vehicle/vehicle.module';
import { ROSNodeService } from './rosNode.service';

@Module({
  imports: [forwardRef(() => VehicleModule), forwardRef(() => AgentModule)],
  providers: [ROSNodeService],
  exports: [ROSNodeService]
})
export class ROSNodeModule {}
