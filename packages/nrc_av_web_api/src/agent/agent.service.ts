import { message, SocketEnum } from './../core';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { AgentGateway } from './agent.gateway';
import { Car, Cmd } from '../core';
import { DataSource } from 'typeorm';

@Injectable()
export class AgentService {
  constructor(
    private readonly agentGateway: AgentGateway,
    private readonly dataSource: DataSource,
  ) {}

  async sendROSMasterCommand(carId: number) {
    const car = await this.dataSource.getRepository(Car).findOne({
      where: { id: carId },
    });
    if (!car)
      throw new HttpException(message.carNotFound, HttpStatus.NOT_FOUND);

    try {
      return await this.agentGateway.emitToRoom(
        SocketEnum.EVENT_RUN_ROS_MASTER,
        `${SocketEnum.ROOM_PREFIX}${car.certKey}`,
        {
          data: SocketEnum.RUN_ROS_MASTER_COMMAND,
        },
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async sendROSLaunchCommand(carId: number, rosNodeId: number) {
    const car = await this.dataSource.getRepository(Car).findOne({
      where: { id: carId },
    });
    if (!car)
      throw new HttpException(message.carNotFound, HttpStatus.NOT_FOUND);

    const cmd = await this.dataSource.getRepository(Cmd).findOne({
      where: { id: rosNodeId },
    });

    try {
      return await this.agentGateway.emitToRoom(
        SocketEnum.EVENT_RUN_ROS_NODE,
        `${SocketEnum.ROOM_PREFIX}${car.certKey}`,
        {
          data: cmd.command,
        },
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
