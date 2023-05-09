import { Injectable } from '@nestjs/common';
import { Command } from '../core';
import { CommandDTO } from '../interface/dto/command.dto';

@Injectable()
export class CommandService {
  updateCommands(currentCmds: Command[], newCmds: CommandDTO[]): Command[] {
    const updatedCmds: Command[] = [];
    newCmds.forEach((newCmd) => {
      const currentCmd = currentCmds.find((currentCmd) => currentCmd.id === newCmd.id);
      if (currentCmd) {
        currentCmd.name = newCmd.name;
        currentCmd.command = newCmd.command;
        currentCmd.nodes = newCmd.nodes;
        currentCmd.inclByDef = newCmd.inclByDef;
        currentCmd.autoStart = newCmd.autoStart;
        currentCmd.autoRecord = newCmd.autoRecord;
        updatedCmds.push(currentCmd);
        currentCmds.splice(currentCmds.indexOf(currentCmd), 1);
      } else {
        updatedCmds.push(
          new Command(
            newCmd.name,
            newCmd.command,
            newCmd.nodes,
            newCmd.inclByDef,
            newCmd.autoStart,
            newCmd.autoRecord
          )
        );
      }
    });
    currentCmds.forEach((currentCmd) => {
      currentCmd.isDeleted = true;
    });
    return updatedCmds.concat(currentCmds);
  }
}
