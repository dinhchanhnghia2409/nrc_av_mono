import { Module } from '@nestjs/common';
import { InterfaceModule } from '../interface/interface.module';
import { VehicleModule } from '../vehicle/vehicle.module';
import { AgentGateway } from './agent.gateway';

@Module({
  imports: [VehicleModule, InterfaceModule],
  providers: [AgentGateway],
  exports: [AgentGateway]
})
export class AgentModule {}
