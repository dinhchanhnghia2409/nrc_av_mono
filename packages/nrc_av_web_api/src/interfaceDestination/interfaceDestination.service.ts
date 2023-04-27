import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Destination, Interface, InterfaceDestination } from '../core';
import { InterfaceDestDTO } from '../interface/dto/interfaceDestination.dto';

@Injectable()
export class InterfaceDestinationService {
  async addInterfaceDests(
    transactionalEntityManager: EntityManager,
    interfaceDestDTOs: InterfaceDestDTO[],
    agentInterface: Interface
  ): Promise<InterfaceDestination[]> {
    return await transactionalEntityManager.save(
      InterfaceDestination,
      interfaceDestDTOs.map((interfaceDestDTO) => ({
        name: interfaceDestDTO.name,
        destination: new Destination(
          interfaceDestDTO.posX,
          interfaceDestDTO.posY,
          interfaceDestDTO.posTh
        ),
        interface: agentInterface
      }))
    );
  }
}
