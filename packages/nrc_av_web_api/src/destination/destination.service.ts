import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Destination } from '../core';
import { DestinationDTO } from '../interface/dto/destination.dto';

@Injectable()
export class DestinationService {
  async addDests(
    transactionalEntityManager: EntityManager,
    destDTOs: DestinationDTO[]
  ): Promise<Destination[]> {
    return await transactionalEntityManager.save(Destination, destDTOs);
  }
}
