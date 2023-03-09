import { Module } from '@nestjs/common';
import { forwardRef } from '@nestjs/common/utils';
import { DatabaseModule } from '../core';
import { VehicleModule } from '../vehicle/vehicle.module';
import { ROSNodesController } from './rosNode.controller';
import { ROSNodeService } from './rosNode.service';

@Module({
  imports: [DatabaseModule, forwardRef(() => VehicleModule)],
  controllers: [ROSNodesController],
  providers: [ROSNodeService],
  exports: [ROSNodeService]
})
export class ROSNodeModule {}
