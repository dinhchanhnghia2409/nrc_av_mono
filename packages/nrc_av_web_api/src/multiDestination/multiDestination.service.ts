import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Destination, MultiDestination } from '../core';
import { DestinationService } from '../destination/destination.service';
import { MultiDestinationDTO } from '../interface/dto/multiDestination.dto';

@Injectable()
export class MultiDestinationService {
  constructor(private readonly destinationService: DestinationService) {}
  async addMultiDests(
    transactionalEntityManager: EntityManager,
    multiDestDTOs: MultiDestinationDTO[]
  ): Promise<MultiDestination[]> {
    const multiDests = multiDestDTOs.map(
      (multiDestDTO) =>
        new MultiDestination(
          multiDestDTO.name,
          multiDestDTO.destinations.map((dest) => new Destination(dest.posX, dest.posY, dest.posTh))
        )
    );

    return await transactionalEntityManager.save(MultiDestination, multiDests);
  }

  async updateMultiDests(
    currentMultiDests: MultiDestination[],
    newMultiDests: MultiDestinationDTO[],
    transactionalEntityManager: EntityManager
  ): Promise<MultiDestination[]> {
    const updatedMultiDests: MultiDestination[] = [];
    newMultiDests.forEach((newMultiDest) => {
      const currentMultiDest = currentMultiDests.find(
        (currentMultiDest) => currentMultiDest.id === newMultiDest.id
      );
      if (currentMultiDest) {
        currentMultiDest.name = newMultiDest.name;
        currentMultiDest.destinations = this.destinationService.updateDests(
          currentMultiDest.destinations,
          newMultiDest.destinations
        );
        updatedMultiDests.push(currentMultiDest);
      } else {
        updatedMultiDests.push(
          new MultiDestination(
            newMultiDest.name,
            newMultiDest.destinations.map(
              (dest) => new Destination(dest.posX, dest.posY, dest.posTh)
            )
          )
        );
      }
    });
    return await transactionalEntityManager.save(MultiDestination, updatedMultiDests);
  }
}
