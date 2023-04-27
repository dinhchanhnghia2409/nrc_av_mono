import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { DestinationList, MultiDestination } from '../core';
import { DestinationListService } from '../destinationList/destinationList.service';
import { MultiDestinationDTO } from '../interface/dto/multiDestination.dto';
import { DestinationService } from './../destination/destination.service';

@Injectable()
export class MultiDestinationService {
  constructor(
    private readonly destinationService: DestinationService,
    private readonly destinationListService: DestinationListService
  ) {}
  async addMultiDests(
    transactionalEntityManager: EntityManager,
    multiDestDTOs: MultiDestinationDTO[]
  ): Promise<MultiDestination[]> {
    const dests = await this.destinationService.addDests(
      transactionalEntityManager,
      multiDestDTOs.reduce((acc, multiDestDTO) => [...acc, ...multiDestDTO.destinations], [])
    );
    let multiDests = multiDestDTOs.map((multiDestDTO) => new MultiDestination(multiDestDTO.name));

    multiDests = await transactionalEntityManager.save(MultiDestination, multiDests);
    const destList: DestinationList[] = [];
    const destListResponse: DestinationList[] = [];
    multiDestDTOs.forEach((multiDestDTO) => {
      const multiDest = multiDests.find((multiDest) => multiDest.name === multiDestDTO.name);
      dests.forEach((dest) => {
        const destDTO = multiDestDTO.destinations.find(
          (destination) =>
            destination.posX === dest.posX &&
            destination.posY === dest.posY &&
            destination.posTh === dest.posTh
        );
        if (destDTO) {
          multiDestDTO.destinations.splice(multiDestDTO.destinations.indexOf(destDTO), 1);
          const newDestinationList = new DestinationList(dest, multiDest);
          destList.push(newDestinationList);
          destListResponse.push(newDestinationList);
        }
      });
    });
    await this.destinationListService.addDestinationLists(transactionalEntityManager, destList);

    return multiDests.map((multiDest) => ({
      ...multiDest,
      destinationList: destListResponse.reduce((acc, destList) => {
        if (destList.multi_destination_id === multiDest.id) {
          destList.multiDestination = null;
          return [...acc, destList];
        }
        return acc;
      }, [])
    }));
  }
}
