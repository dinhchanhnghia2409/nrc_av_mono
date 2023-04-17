import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { Interface, message } from '../core';

@Injectable()
export class InterfaceService {
  constructor(private readonly dataSource: DataSource) {}

  async getInterfaceWithAllRelations(id: number): Promise<Interface> {
    const agentInterface = await this.dataSource.getRepository(Interface).findOne({
      where: {
        id
      },
      relations: [
        'machines',
        'sensors',
        'algorithms',
        'commands',
        'multiDestinations',
        'destinationLists',
        'destinationLists.destination',
        'multiDestinations.destinations'
      ]
    });
    if (!agentInterface) {
      throw new HttpException(message.interfaceNotFound, HttpStatus.NOT_FOUND);
    }
    return agentInterface;
  }

  getInterfacesWithAllRelationsByNames(names: string[]): Promise<Interface[]> {
    return this.dataSource.getRepository(Interface).find({
      where: {
        name: In(names)
      },
      relations: [
        'machines',
        'sensors',
        'algorithms',
        'commands',
        'multiDestinations',
        'destinationLists',
        'destinationLists.destination',
        'multiDestinations.destinations'
      ]
    });
  }

  getInterfaceByNames(names: string[]): Promise<Interface[]> {
    return this.dataSource.getRepository(Interface).find({
      where: {
        name: In(names)
      }
    });
  }

  getInterfaceByName(name: string): Promise<Interface> {
    return this.dataSource.getRepository(Interface).findOne({
      where: {
        name
      }
    });
  }
}
