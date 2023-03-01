import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  Car,
  DatabaseService,
  CarStatus,
  Model,
  message,
  SocketEnum,
} from '../core';
import { DataSource } from 'typeorm';
import { CarGateway } from './car.gateway';

@Injectable()
export class CarService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly dataSource: DataSource,
    private readonly carGateway: CarGateway,
  ) {}

  async updateStatus(id: number): Promise<Car> {
    let car = await this.databaseService.getOneByField(Car, 'id', id);

    if (car.status !== CarStatus.WAITING)
      throw new HttpException(message.invalidStatus, HttpStatus.BAD_REQUEST);
    car.status = CarStatus.ACTIVE;

    car = await this.databaseService.save(Car, car);
    const result = await this.carGateway.emitToRoom(
      SocketEnum.EVENT_CAR_ACTIVATION,
      `${SocketEnum.ROOM_PREFIX}${car.certKey}`,
      {
        certKey: car.certKey,
      },
    );

    if (result[0] !== car.certKey) {
      car.status = CarStatus.WAITING;
      await this.databaseService.save(Car, car);
      throw new HttpException(
        message.agentError,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return car;
  }

  async registerCar(
    certKey: string,
    macAddress: string,
    licenseNumber: string,
  ): Promise<Car> {
    let car = await this.databaseService.getOneByField(Car, 'certKey', certKey);
    if (car) return car;
    const model = await this.databaseService.getOneByField(Model, 'id', 1);

    car = new Car();
    car.certKey = certKey;
    car.macAddress = macAddress;
    car.licenseNumber = licenseNumber;
    car.model = model;
    car.lastConnected = new Date();

    car = await this.databaseService.save(Car, car);
    return car;
  }

  async activeCar(certKey: string): Promise<Car> {
    const car = await this.databaseService.getOneByField(
      Car,
      'certKey',
      certKey,
    );
    if (!car || car.status !== CarStatus.REGISTERED) return null;

    car.status = CarStatus.ACTIVE;
    car.lastConnected = new Date();
    return await this.databaseService.save<Car>(Car, car);
  }

  async getCarById(id: number): Promise<Car> {
    return await this.dataSource.getRepository(Car).findOne({
      where: { id: id },
      loadEagerRelations: true,
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
