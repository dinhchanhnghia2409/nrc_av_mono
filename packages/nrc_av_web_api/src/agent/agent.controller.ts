import { AgentService } from './agent.service';
import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger/dist';
import { Response } from 'express';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CarService } from '../car/car.service';
import { UserGuard } from '../core';

@ApiTags('agent')
@Controller('agent')
@UseGuards(UserGuard)
export class AgentController {
  constructor(
    private readonly agentService: AgentService,
    private readonly carService: CarService,
  ) {}

  @Post('/socket/:carId/ROS-master')
  async runROSmaster(
    @Param('carId', ParseIntPipe) carId: number,
    @Res() res: Response,
  ) {
    const result = await this.agentService.sendROSMasterCommand(carId);
    return res.send(result[0]);
  }

  @Post('/socket/:carId/ROS-node/:rosNodeId')
  async runROSnode(
    @Param('carId', ParseIntPipe) carId: number,
    @Param('rosNodeId', ParseIntPipe) rosNodeId: number,
    @Res() res: Response,
  ) {
    return res.send(
      await this.agentService.sendROSLaunchCommand(carId, rosNodeId),
    );
  }

  @Get('/socket')
  async getMessageBySocket(@Res() res: Response) {
    return res.send(await this.agentService.getMessageBySocket());
  }

  @MessagePattern('carRegistration')
  async getNotifications(@Payload() data: any) {
    await this.carService.registerCar(
      data.certKey,
      data.macAddress,
      data.licenseNumber,
    );
  }

  @MessagePattern('carActivation')
  async activeCar(@Payload() data: any) {
    await this.carService.activeCar(data.certKey);
  }

  @MessagePattern('imAlive')
  async aliveCar(@Payload() data: string) {}
}
