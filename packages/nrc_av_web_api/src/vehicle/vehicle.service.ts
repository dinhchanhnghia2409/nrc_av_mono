import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AgentGateway } from '../agent/agent.gateway';
import {
  Vehicle,
  VehicleStatus,
  Model,
  message,
  SocketEnum,
  IResponse,
  ISuccessResponse,
  SocketEventEnum
} from '../core';
import { LaunchFileForRunningDTO } from './dto/launchFileForRunning.request.dto';
import { LaunchFileForStoppingDTO } from './dto/launchFileForStopping.request.dto';
import { RegisterAgentDTO } from './dto/registerAgent.dto';
import { ROSNodesForRunningDTO } from './dto/rosNodeForRunning.request.dto';

@Injectable()
export class VehicleService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly agentGateway: AgentGateway
  ) {}

  async activateVehicle(id: number): Promise<Vehicle> {
    let vehicle = await this.getVehicle(id);
    if (vehicle.status !== VehicleStatus.WAITING) {
      throw new HttpException(message.invalidStatus, HttpStatus.BAD_REQUEST);
    }

    try {
      await this.getResultFromAgent(vehicle, SocketEventEnum.VEHICLE_ACTIVATION, {
        certKey: vehicle.certKey
      });
    } catch (err) {
      throw new HttpException(err, HttpStatus.SERVICE_UNAVAILABLE);
    }

    try {
      vehicle.status = VehicleStatus.ACTIVE;
      vehicle.nodeList = undefined;
      vehicle = await this.dataSource.getRepository(Vehicle).save(vehicle);
    } catch (err) {
      throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return vehicle;
  }

  async registerVehicle(registerAgentDTO: RegisterAgentDTO): Promise<Vehicle> {
    const { macAddress, model: modelName, certKey, name } = registerAgentDTO;
    let vehicle = await this.dataSource.getRepository(Vehicle).findOne({
      where: { certKey }
    });
    if (vehicle) {
      vehicle.isOnline = true;
      vehicle.lastConnected = new Date();
      vehicle = await this.dataSource.getRepository(Vehicle).save(vehicle);
      return vehicle;
    }
    let model = await this.dataSource.getRepository(Model).findOne({
      where: { name: modelName }
    });

    if (!model) {
      model = await this.dataSource.getRepository(Model).save(new Model(modelName));
    }

    vehicle = new Vehicle();
    vehicle.certKey = certKey;
    vehicle.macAddress = macAddress;
    vehicle.model = model;
    vehicle.name = name;
    vehicle.isOnline = true;
    vehicle.lastConnected = new Date();

    vehicle = await this.dataSource.getRepository(Vehicle).save(vehicle);
    return vehicle;
  }

  async getWaitingOnlineVehicles(): Promise<Vehicle[]> {
    return await this.dataSource.getRepository(Vehicle).find({
      where: {
        status: VehicleStatus.WAITING,
        isOnline: true
      },
      loadEagerRelations: true
    });
  }

  async getActiveOnlineVehicles(): Promise<Vehicle[]> {
    return await this.dataSource.getRepository(Vehicle).find({
      where: {
        status: VehicleStatus.ACTIVE,
        isOnline: true
      },
      loadEagerRelations: true
    });
  }

  async getVehicle(id: number): Promise<Vehicle> {
    const vehicle = await this.dataSource.getRepository(Vehicle).findOne({
      where: { id },
      relations: ['nodeList', 'nodeList.rosNode']
    });
    if (!vehicle) {
      throw new HttpException(message.vehicleNotFound, HttpStatus.NOT_FOUND);
    }
    return vehicle;
  }

  async handleVehicleDisconnection(certKey: string): Promise<void> {
    const vehicle = await this.dataSource.getRepository(Vehicle).findOne({
      where: {
        certKey
      }
    });
    if (vehicle) {
      vehicle.isOnline = false;
      await this.dataSource.getRepository(Vehicle).save(vehicle);
    }
  }

  async handleVehicleConnection(certKey: string): Promise<boolean> {
    const vehicle = await this.dataSource.getRepository(Vehicle).findOne({
      where: {
        certKey
      }
    });
    if (vehicle) {
      vehicle.isOnline = true;
      vehicle.lastConnected = new Date();
      await this.dataSource.getRepository(Vehicle).save(vehicle);
      return true;
    } else {
      return false;
    }
  }

  async sendROSMasterCommand(vehicleId: number) {
    const vehicle = await this.getVehicle(vehicleId);
    try {
      return await this.getResultFromAgent(vehicle, SocketEventEnum.RUN_ROS_MASTER, {});
    } catch (error) {
      throw new HttpException(error, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async sendROSNodesForRunning(vehicleId: number, rosNodesForRunningDTO: ROSNodesForRunningDTO) {
    const vehicle = await this.getVehicle(vehicleId);
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
      return await this.getResultFromAgent(vehicle, SocketEventEnum.RUN_ROS_NODE, {
        nodeArr: rosNodes.map((node) => ({ name: node.name, packageName: node.packageName }))
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async getResultFromAgent(vehicle: Vehicle, event: string, data: any): Promise<ISuccessResponse> {
    const resultFromAgent = (await this.agentGateway.emitToRoom(
      event,
      `${SocketEnum.ROOM_PREFIX}${vehicle.certKey}`,
      data
    )) as IResponse;

    if (resultFromAgent.status === 'error') {
      throw resultFromAgent.message;
    } else if (resultFromAgent.status !== 'success') {
      vehicle.isOnline = false;
      vehicle.nodeList = undefined;
      await this.dataSource.getRepository(Vehicle).save(vehicle);
      throw message.agentIsOffline;
    }

    return resultFromAgent as ISuccessResponse;
  }

  async sendLaunchFileForRunning(
    vehicleId: number,
    launchFileFoRunningDTO: LaunchFileForRunningDTO
  ) {
    const vehicle = await this.getVehicle(vehicleId);
    const { names: fileNames } = launchFileFoRunningDTO;
    try {
      return await this.getResultFromAgent(vehicle, SocketEventEnum.RUN_INTERFACE, {
        fileNames
      });
    } catch (err) {
      throw new HttpException(err, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async getLaunchFileStatus(vehicleId: number) {
    const vehicle = await this.getVehicle(vehicleId);
    let resultFromAgent: ISuccessResponse;
    try {
      resultFromAgent = await this.getResultFromAgent(
        vehicle,
        SocketEventEnum.GET_INTERFACE_STATUS,
        {}
      );
    } catch (err) {
      return [];
    }

    return resultFromAgent.data;
  }

  async sendLaunchFileForStopping(
    vehicleId: number,
    launchFileForStoppingDTO: LaunchFileForStoppingDTO
  ) {
    const vehicle = await this.getVehicle(vehicleId);
    const { names: fileNames } = launchFileForStoppingDTO;
    try {
      return await this.getResultFromAgent(vehicle, SocketEventEnum.STOP_INTERFACE, {
        fileNames
      });
    } catch (err) {
      throw new HttpException(err, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
