import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { DataSource } from 'typeorm';
import { RegisterAgentDTO } from '../agent/dto/registerAgent.dto';
import { Car, DatabaseService, CarStatus, Model, message, SocketEnum } from '../core';
import { CarGateway } from './car.gateway';

@Injectable()
export class CarService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly dataSource: DataSource,
    private readonly carGateway: CarGateway
  ) {}

  async updateStatus(id: number): Promise<Car> {
    let car = await this.databaseService.getOneByField(Car, 'id', id);

    if (car.status !== CarStatus.WAITING) {
      throw new HttpException(message.invalidStatus, HttpStatus.BAD_REQUEST);
    }
    car.status = CarStatus.ACTIVE;

    car = await this.databaseService.save(Car, car);
    try {
      await this.carGateway.emitToRoom(
        SocketEnum.EVENT_CAR_ACTIVATION,
        `${SocketEnum.ROOM_PREFIX}${car.certKey}`,
        {
          certKey: car.certKey
        }
      );
    } catch (err) {
      throw new HttpException(message.agentError, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return car;
  }

  async registerCar(registerAgentDTO: RegisterAgentDTO): Promise<Car> {
    const { macAddress, model: modelName, certKey, name } = registerAgentDTO;
    let car = await this.databaseService.getOneByField(Car, 'certKey', certKey);
    if (car) {
      return car;
    }
    const model = await this.databaseService.getOneByField(Model, 'name', modelName);

    if (!model) {
      throw new WsException(message.modelNotFound);
    }

    car = new Car();
    car.certKey = certKey;
    car.macAddress = macAddress;
    car.model = model;
    car.name = name;
    car.lastConnected = new Date();

    car = await this.databaseService.save(Car, car);
    return car;
  }

  async activeCar(certKey: string): Promise<Car> {
    const car = await this.databaseService.getOneByField(Car, 'certKey', certKey);
    if (!car || car.status !== CarStatus.REGISTERED) {
      return null;
    }

    car.status = CarStatus.ACTIVE;
    car.lastConnected = new Date();
    return await this.databaseService.save<Car>(Car, car);
  }

  async getCarByField(field: keyof Car, value: any): Promise<Car> {
    return await this.dataSource.getRepository(Car).findOne({
      where: { [field]: value },
      loadEagerRelations: true
    });
  }

  async getCarsByField(field: keyof Car, value: any): Promise<Car[]> {
    return await this.dataSource.getRepository(Car).find({
      where: { [field]: value },
      loadEagerRelations: true
    });
  }

  // @Cron('5 * * * * *')
  // async checkCarStatus() {
  //   const cars = await this.databaseService.getMany(Car);
  //   if (!cars || cars.length === 0) return;

  //   cars.forEach((car) => {
  //     const lastConnected = moment(car.lastConnected).add(45, 'seconds');
  //     const now = moment(new Date());
  //     if (now.isAfter(lastConnected)) {
  //       car.status = CarStatus.OFFLINE;
  //     }
  //   });

  //   await this.databaseService.saveMany(Car, cars);
  // }
}
