import { Module } from '@nestjs/common';
import { forwardRef } from '@nestjs/common/utils';
import { AgentModule } from '../agent/agent.module';
import { AuthModule } from '../auth/auth.module';
import { InterfaceModule } from '../interface/interface.module';
import { ROSNodeModule } from '../rosNode/rosNode.module';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';

@Module({
  imports: [
    forwardRef(() => AgentModule),
    AuthModule,
    forwardRef(() => ROSNodeModule),
    InterfaceModule
  ],
  controllers: [VehicleController],
  providers: [VehicleService],
  exports: [VehicleService]
})
export class VehicleModule {}
