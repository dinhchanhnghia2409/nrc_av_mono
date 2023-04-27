import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { DestinationList } from '../core';

@Injectable()
export class DestinationListService {
  async addDestinationLists(
    transactionalEntityManager: EntityManager,
    destinationLists: DestinationList[]
  ): Promise<DestinationList[]> {
    return await transactionalEntityManager.save(DestinationList, destinationLists);
  }
}
