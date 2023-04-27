import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource, EntityManager, ILike, In } from 'typeorm';
import { AlgorithmService } from '../algorithm/algorithm.service';
import { CommandService } from '../command/command.service';
import { Interface, message } from '../core';
import { InterfaceDestinationService } from '../interfaceDestination/interfaceDestination.service';
import { MachineService } from '../machine/machine.service';
import { MultiDestinationService } from '../multiDestination/multiDestination.service';
import { SensorService } from '../sensor/sensor.service';
import { InterfaceDTO } from './dto/interface.dto';
import { InterfaceFilteringDTO, InterfaceList } from './dto/interfaceFiltering.dto';

@Injectable()
export class InterfaceService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly algorithmService: AlgorithmService,
    private readonly machineService: MachineService,
    private readonly commandService: CommandService,
    private readonly sensorService: SensorService,
    private readonly interfaceDestinationService: InterfaceDestinationService,
    private readonly multiDestinationService: MultiDestinationService
  ) {}

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
        'interfaceDestinations',
        'interfaceDestinations.destination',
        'multiDestinations.destinationList',
        'multiDestinations.destinationList.destination'
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
        'interfaceDestinations',
        'interfaceDestinations.destination',
        'multiDestinations.destinationList',
        'multiDestinations.destinationList.destination'
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

  async createInterface(interfaceDTO: InterfaceDTO): Promise<Interface> {
    const {
      name,
      algs: algorithms,
      cmds: commands,
      dests: destinations,
      machines,
      multiDests: multiDestinations,
      sensors
    } = interfaceDTO;

    const existedAgentInterface = await this.getInterfaceByName(name);
    if (existedAgentInterface) {
      throw new HttpException(message.interfaceExisted, HttpStatus.BAD_REQUEST);
    }

    let newInterface = new Interface(name);

    await this.dataSource.manager.transaction(async (transactionalEntityManager: EntityManager) => {
      if (machines?.length) {
        const newMachines = await this.machineService.addMachines(
          transactionalEntityManager,
          machines
        );
        newInterface.machines = newMachines;
      }

      if (algorithms?.length) {
        const newAlgs = await this.algorithmService.addAlgorithms(
          transactionalEntityManager,
          algorithms
        );
        newInterface.algorithms = newAlgs;
      }

      if (commands?.length) {
        const newCmds = await this.commandService.addCommands(transactionalEntityManager, commands);
        newInterface.commands = newCmds;
      }

      if (sensors?.length) {
        const newSensors = await this.sensorService.addsensors(transactionalEntityManager, sensors);
        newInterface.sensors = newSensors;
      }

      if (multiDestinations?.length) {
        const newMultiDests = await this.multiDestinationService.addMultiDests(
          transactionalEntityManager,
          multiDestinations
        );
        newInterface.multiDestinations = newMultiDests;
      }
      newInterface = await transactionalEntityManager.save(Interface, newInterface);

      if (destinations?.length) {
        const newDests = (
          await this.interfaceDestinationService.addInterfaceDests(
            transactionalEntityManager,
            destinations,
            newInterface
          )
        ).map((interfaceDest) => ({ ...interfaceDest, interface: null }));

        newInterface.interfaceDestinations = newDests;
      }
    });

    return newInterface;
  }

  async listInterfaces(interfaceFilteringDTO: InterfaceFilteringDTO): Promise<InterfaceList> {
    const { name, order, currentPage, orderBy, pageSize } = interfaceFilteringDTO;
    const interfaces = await this.dataSource.getRepository(Interface).find({
      where: {
        name: ILike(`%${name}%`)
      },
      order: {
        [orderBy]: order
      },
      skip: currentPage * pageSize,
      take: pageSize,
      relations: ['model']
    });
    const total = await this.dataSource.getRepository(Interface).count({
      where: {
        name: ILike(`%${name}%`)
      }
    });
    return { interfaces, total };
  }
}
