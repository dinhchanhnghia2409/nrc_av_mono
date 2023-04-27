import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Sensor } from '../core';
import { SensorDTO } from '../interface/dto/sensor.dto';

@Injectable()
export class SensorService {
  async addsensors(
    transactionalEntityManager: EntityManager,
    sensorDTOs: SensorDTO[]
  ): Promise<Sensor[]> {
    return await transactionalEntityManager.save(Sensor, sensorDTOs);
  }
}
