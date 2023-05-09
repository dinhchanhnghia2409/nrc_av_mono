import { Injectable } from '@nestjs/common';
import { Machine } from '../core';
import { MachineDTO } from '../interface/dto/machine.dto';

@Injectable()
export class MachineService {
  updateMachines(currentMachines: Machine[], newMachines: MachineDTO[]): Machine[] {
    const updatedMachines: Machine[] = [];
    newMachines.forEach((newMachine) => {
      const currentMachine = currentMachines.find(
        (currentMachine) => currentMachine.id === newMachine.id
      );
      if (currentMachine) {
        currentMachine.name = newMachine.name;
        currentMachine.addr = newMachine.addr;
        updatedMachines.push(currentMachine);
        currentMachines.splice(currentMachines.indexOf(currentMachine), 1);
      } else {
        updatedMachines.push(new Machine(newMachine.name, newMachine.addr));
      }
    });
    currentMachines.forEach((currentMachine) => {
      currentMachine.isDeleted = true;
    });
    return updatedMachines.concat(currentMachines);
  }
}
