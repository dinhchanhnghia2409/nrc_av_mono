import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Command } from '../core';
import { CommandDTO } from '../interface/dto/command.dto';

@Injectable()
export class CommandService {
  async addCommands(
    transactionalEntityManager: EntityManager,
    cmdDTOs: CommandDTO[]
  ): Promise<Command[]> {
    return await transactionalEntityManager.save(
      Command,
      cmdDTOs.map(
        (cmd) =>
          new Command(
            cmd.name,
            cmd.command,
            cmd.nodes,
            cmd.inclByDef,
            cmd.autoStart,
            cmd.autoRecord
          )
      )
    );
  }
}
