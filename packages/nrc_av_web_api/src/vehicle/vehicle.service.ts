import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterAgentDTO } from '../agent/dto/registerAgent.dto';
import { Vehicle, DatabaseService, VehicleStatus, Model, message, SocketEnum } from '../core';
import { VehicleGateway } from './vehicle.gateway';

@Injectable()
export class VehicleService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly dataSource: DataSource,
    private readonly vehicleGateway: VehicleGateway
  ) {}

  async updateStatus(id: number): Promise<Vehicle> {
    let vehicle = await this.databaseService.getOneByField(Vehicle, 'id', id);

    if (vehicle.status !== VehicleStatus.WAITING) {
      throw new HttpException(message.invalidStatus, HttpStatus.BAD_REQUEST);
    }

    try {
      const resultFromVehicle = (await this.vehicleGateway.emitToRoom(
        SocketEnum.EVENT_VEHICLE_ACTIVATION,
        `${SocketEnum.ROOM_PREFIX}${vehicle.certKey}`,
        {
          certKey: vehicle.certKey
        }
      )) as any[] | { error: string }[];
      await this.checkResponseFromVehicle(resultFromVehicle, vehicle);

      vehicle.status = VehicleStatus.ACTIVE;
      vehicle = await this.databaseService.save(Vehicle, vehicle);
    } catch (err) {
      throw new HttpException(message.agentError, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return vehicle;
  }

  async registerVehicle(registerAgentDTO: RegisterAgentDTO): Promise<Vehicle> {
    const { macAddress, model: modelName, certKey, name } = registerAgentDTO;
    let vehicle = await this.databaseService.getOneByField(Vehicle, 'certKey', certKey);
    if (vehicle) {
      vehicle.isOnline = true;
      vehicle.lastConnected = new Date();
      vehicle = await this.databaseService.save(Vehicle, vehicle);
      return vehicle;
    }
    let model = await this.databaseService.getOneByField(Model, 'name', modelName);

    if (!model) {
      model = await this.databaseService.save(Model, { name: modelName } as Model);
    }

    vehicle = new Vehicle();
    vehicle.certKey = certKey;
    vehicle.macAddress = macAddress;
    vehicle.model = model;
    vehicle.name = name;
    vehicle.isOnline = true;
    vehicle.lastConnected = new Date();

    vehicle = await this.databaseService.save(Vehicle, vehicle);
    return vehicle;
  }

  async activeVehicle(certKey: string): Promise<Vehicle> {
    const vehicle = await this.databaseService.getOneByField(Vehicle, 'certKey', certKey);
    if (!vehicle || vehicle.status !== VehicleStatus.WAITING) {
      return null;
    }

    vehicle.status = VehicleStatus.ACTIVE;
    vehicle.lastConnected = new Date();
    return await this.databaseService.save<Vehicle>(Vehicle, vehicle);
  }

  async getVehicleByField(field: keyof Vehicle, value: any): Promise<Vehicle> {
    return await this.dataSource.getRepository(Vehicle).findOne({
      where: { [field]: value },
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

  async getExistedVehicle(id: number): Promise<Vehicle> {
    const vehicle = await this.dataSource.getRepository(Vehicle).findOne({
      where: { id },
      relations: ['nodeList', 'nodeList.rosNode']
    });
    if (!vehicle) {
      throw new HttpException(message.vehicleNotFound, HttpStatus.NOT_FOUND);
    }
    return vehicle;
  }

  async checkResponseFromVehicle(resultFromVehicle: any[] | { error: string }[], vehicle: Vehicle) {
    if (Array.isArray(resultFromVehicle) && resultFromVehicle.length <= 0) {
      vehicle.isOnline = false;
      vehicle.nodeList = undefined;
      await this.dataSource.getRepository(Vehicle).save(vehicle);
      throw message.agentIsOffline;
    }

    const error = [];
    resultFromVehicle.forEach((r) => {
      if (r.error) {
        error.push(r.error);
      }
    });
    if (error.length > 0) {
      throw { error };
    }
  }

  async handlevehicleDisconnection(certKey: string): Promise<void> {
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
}
