import { Module } from '@nestjs/common';
import { VehicleModule } from '../vehicle/vehicle.module';
import { AgentGateway } from './agent.gateway';

@Module({
  imports: [VehicleModule],
  providers: [AgentGateway],
  exports: [AgentGateway]
})
export class AgentModule {}
