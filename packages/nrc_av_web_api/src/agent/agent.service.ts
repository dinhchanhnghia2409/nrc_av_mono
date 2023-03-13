import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Vehicle, message, SocketEnum } from '../core';
import { VehicleService } from '../vehicle/vehicle.service';
import { AgentGateway } from './agent.gateway';
import { ROSNodesForRunningDTO } from './dto/ROSNodeForRunning.request.dto';

@Injectable()
export class AgentService {
  constructor(
    private readonly agentGateway: AgentGateway,
    private readonly dataSource: DataSource,
    private readonly vehicleService: VehicleService
  ) {}
  async sendROSMasterCommand(vehicleId: number) {
    const vehicle = await this.dataSource
      .getRepository(Vehicle)
      .findOne({ where: { id: vehicleId } });
    if (!vehicle) {
      throw new HttpException(message.vehicleNotFound, HttpStatus.NOT_FOUND);
    }
    try {
      const resultFromVehicle = (await this.agentGateway.emitToRoom(
        SocketEnum.EVENT_RUN_ROS_MASTER,
        `${SocketEnum.ROOM_PREFIX}${vehicle.certKey}`,
        {}
      )) as string[] | { error: string }[];

      await this.vehicleService.checkResponseFromVehicle(resultFromVehicle, vehicle);
      return resultFromVehicle;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async sendROSNodesForRunning(vehicleId: number, rosNodesForRunningDTO: ROSNodesForRunningDTO) {
    const vehicle = await this.dataSource.getRepository(Vehicle).findOne({
      where: { id: vehicleId },
      relations: ['nodeList', 'nodeList.rosNode']
    });
    if (!vehicle) {
      throw new HttpException(message.vehicleNotFound, HttpStatus.NOT_FOUND);
    }

    const rosNodes = rosNodesForRunningDTO.nodeIds.map((id) => {
      const node = vehicle.nodeList.find((node) => node.rosNode.id === id);
      if (!node) {
        throw new HttpException(message.rosNodeNotFound, HttpStatus.NOT_FOUND);
      }
      return node.rosNode;
    });
    if (!rosNodes) {
      throw new HttpException(message.rosNodeNotFound, HttpStatus.NOT_FOUND);
    }
    try {
      const resultFromVehicle = (await this.agentGateway.emitToRoom(
        SocketEnum.EVENT_RUN_ROS_NODE,
        `${SocketEnum.ROOM_PREFIX}${vehicle.certKey}`,
        {
          nodeArr: rosNodes.map((node) => ({ name: node.name, packageName: node.packageName }))
        }
      )) as string[] | { error: string }[];
      await this.vehicleService.checkResponseFromVehicle(resultFromVehicle, vehicle);
      return resultFromVehicle;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
