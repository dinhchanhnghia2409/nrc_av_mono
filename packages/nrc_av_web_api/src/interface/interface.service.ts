import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource, EntityManager, ILike, In } from 'typeorm';
import { AlgorithmService } from '../algorithm/algorithm.service';
import { CommandService } from '../command/command.service';
import { Algorithm, Alias, Command, Interface, Machine, Sensor, message } from '../core';
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
    const agentInterface = await this.dataSource
      .getRepository(Interface)
      .createQueryBuilder(Alias.INTERFACE)
      .leftJoinAndSelect(
        `${Alias.INTERFACE}.${Alias.MACHINES}`,
        Alias.MACHINES,
        `${Alias.MACHINES}.isDeleted = false`
      )
      .leftJoinAndSelect(
        `${Alias.INTERFACE}.${Alias.SENSORS}`,
        Alias.SENSORS,
        `${Alias.SENSORS}.isDeleted = false`
      )
      .leftJoinAndSelect(
        `${Alias.INTERFACE}.${Alias.ALGORITHMS}`,
        Alias.ALGORITHMS,
        `${Alias.ALGORITHMS}.isDeleted = false`
      )
      .leftJoinAndSelect(
        `${Alias.INTERFACE}.${Alias.COMMANDS}`,
        Alias.COMMANDS,
        `${Alias.COMMANDS}.isDeleted = false`
      )
      .leftJoinAndSelect(
        `${Alias.INTERFACE}.${Alias.MULTI_DESTINATIONS}`,
        Alias.MULTI_DESTINATIONS,
        `${Alias.MULTI_DESTINATIONS}.isDeleted = false`
      )
      .leftJoinAndSelect(
        `${Alias.INTERFACE}.${Alias.INTERFACE_DESTINATIONS}`,
        Alias.INTERFACE_DESTINATIONS,
        `${Alias.INTERFACE_DESTINATIONS}.isDeleted = false`
      )
      .leftJoinAndSelect(
        `${Alias.INTERFACE_DESTINATIONS}.${Alias.DESTINATION}`,
        Alias.DESTINATION,
        `${Alias.DESTINATION}.isDeleted = false`
      )
      .leftJoinAndSelect(
        `${Alias.MULTI_DESTINATIONS}.${Alias.DESTINATIONS}`,
        Alias.DESTINATIONS,
        `${Alias.DESTINATIONS}.isDeleted = false`
      )
      .where({ id, isDeleted: false })
      .getOne();
    if (!agentInterface) {
      throw new HttpException(message.interfaceNotFound, HttpStatus.NOT_FOUND);
    }
    return agentInterface;
  }

  getInterfacesWithAllRelationsByNames(names: string[]): Promise<Interface[]> {
    return this.dataSource
      .getRepository(Interface)
      .createQueryBuilder(Alias.INTERFACE)
      .leftJoinAndSelect(
        `${Alias.INTERFACE}.${Alias.MACHINES}`,
        Alias.MACHINES,
        `${Alias.MACHINES}.isDeleted = false`
      )
      .leftJoinAndSelect(
        `${Alias.INTERFACE}.${Alias.SENSORS}`,
        Alias.SENSORS,
        `${Alias.SENSORS}.isDeleted = false`
      )
      .leftJoinAndSelect(
        `${Alias.INTERFACE}.${Alias.ALGORITHMS}`,
        Alias.ALGORITHMS,
        `${Alias.ALGORITHMS}.isDeleted = false`
      )
      .leftJoinAndSelect(
        `${Alias.INTERFACE}.${Alias.COMMANDS}`,
        Alias.COMMANDS,
        `${Alias.COMMANDS}.isDeleted = false`
      )
      .leftJoinAndSelect(
        `${Alias.INTERFACE}.${Alias.MULTI_DESTINATIONS}`,
        Alias.MULTI_DESTINATIONS,
        `${Alias.MULTI_DESTINATIONS}.isDeleted = false`
      )
      .leftJoinAndSelect(
        `${Alias.INTERFACE}.${Alias.INTERFACE_DESTINATIONS}`,
        Alias.INTERFACE_DESTINATIONS,
        `${Alias.INTERFACE_DESTINATIONS}.isDeleted = false`
      )
      .leftJoinAndSelect(
        `${Alias.INTERFACE_DESTINATIONS}.${Alias.DESTINATION}`,
        Alias.DESTINATION,
        `${Alias.DESTINATION}.isDeleted = false`
      )
      .leftJoinAndSelect(
        `${Alias.MULTI_DESTINATIONS}.${Alias.DESTINATIONS}`,
        Alias.DESTINATIONS,
        `${Alias.DESTINATIONS}.isDeleted = false`
      )
      .where({
        name: In(names),
        isDeleted: false
      })
      .getMany();
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
      algorithms,
      commands,
      interfaceDestinations: destinations,
      machines,
      multiDestinations,
      sensors
    } = interfaceDTO;

    const existedAgentInterface = await this.getInterfaceByName(name);
    if (existedAgentInterface) {
      throw new HttpException(message.interfaceExisted, HttpStatus.BAD_REQUEST);
    }

    let newInterface = new Interface(name);

    await this.dataSource.manager.transaction(async (transactionalEntityManager: EntityManager) => {
      newInterface.machines = machines?.map((machine) => new Machine(machine.name, machine.addr));

      newInterface.algorithms = algorithms?.map(
        (alg) => new Algorithm(alg.name, alg.errRate, alg.warnRate, alg.topicName, alg.topicType)
      );

      newInterface.commands = commands?.map(
        (cmd) =>
          new Command(
            cmd.name,
            cmd.command,
            cmd.nodes,
            cmd.inclByDef,
            cmd.autoStart,
            cmd.autoRecord
          )
      );

      newInterface.sensors = sensors?.map(
        (sensor) =>
          new Sensor(
            sensor.name,
            sensor.errRate,
            sensor.warnRate,
            sensor.topicName,
            sensor.topicType
          )
      );

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

  async updateInterface(id: number, interfaceDTO: InterfaceDTO) {
    let agentInterface = await this.getInterfaceWithAllRelations(id);
    const {
      name,
      machines,
      algorithms: algs,
      commands: cmds,
      sensors,
      multiDestinations: multiDests,
      interfaceDestinations: dests
    } = interfaceDTO;

    const existedInterface = await this.getInterfaceByName(name);
    if (existedInterface && existedInterface.id !== id) {
      throw new HttpException(message.interfaceExisted, HttpStatus.BAD_REQUEST);
    }

    agentInterface.name = name;
    agentInterface.machines = this.machineService.updateMachines(agentInterface.machines, machines);
    agentInterface.algorithms = this.algorithmService.updateAlgorithms(
      agentInterface.algorithms,
      algs
    );
    agentInterface.commands = this.commandService.updateCommands(agentInterface.commands, cmds);
    agentInterface.sensors = this.sensorService.updateSensors(agentInterface.sensors, sensors);
    await this.dataSource.manager.transaction(async (transactionalEntityManager: EntityManager) => {
      agentInterface.multiDestinations = await this.multiDestinationService.updateMultiDests(
        agentInterface.multiDestinations,
        multiDests,
        transactionalEntityManager
      );
      const currentInterfaceDests = agentInterface.interfaceDestinations;
      delete agentInterface.interfaceDestinations;
      agentInterface = await transactionalEntityManager.save(Interface, agentInterface);
      agentInterface.interfaceDestinations = (
        await this.interfaceDestinationService.updateInterfaceDests(
          currentInterfaceDests,
          dests,
          transactionalEntityManager,
          agentInterface
        )
      )
        .filter((interfaceDest) => !interfaceDest.isDeleted)
        .map((interfaceDest) => ({ ...interfaceDest, interface: null }));
    });

    agentInterface.machines = agentInterface.machines.filter((machine) => !machine.isDeleted);
    agentInterface.algorithms = agentInterface.algorithms.filter(
      (algorithm) => !algorithm.isDeleted
    );
    agentInterface.commands = agentInterface.commands.filter((command) => !command.isDeleted);
    agentInterface.sensors = agentInterface.sensors.filter((sensor) => !sensor.isDeleted);
    agentInterface.multiDestinations = agentInterface.multiDestinations.filter((multiDest) => {
      if (!multiDest.isDeleted) {
        multiDest.destinations = multiDest.destinations.filter((dest) => !dest.isDeleted);
        return true;
      }
      return false;
    });

    return agentInterface;
  }
}
