import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Machine } from '../core';
import { MachineDTO } from '../interface/dto/machine.dto';

@Injectable()
export class MachineService {
  async addMachines(
    transactionalEntityManager: EntityManager,
    machineDTOs: MachineDTO[]
  ): Promise<Machine[]> {
    return await transactionalEntityManager.save(
      Machine,
      machineDTOs.map((machine) => new Machine(machine.name, machine.addr))
    );
  }
}
