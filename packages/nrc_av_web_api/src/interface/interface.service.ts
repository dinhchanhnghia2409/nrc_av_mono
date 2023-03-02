import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Cmd } from '../core';

@Injectable()
export class InterfaceService {
  constructor(private readonly dataSource: DataSource) {}

  getInterfaceCmds(id: number) {
    return this.dataSource.getRepository(Cmd).find({
      where: {
        interfaces: {
          id
        }
      }
    });
  }
}
