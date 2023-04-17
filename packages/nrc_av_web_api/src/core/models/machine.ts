import { Column, Entity, ManyToMany } from 'typeorm';
import { BaseModel } from './base';
import { Interface } from './interface';

@Entity()
export class Machine extends BaseModel {
  @Column()
  name: string;

  @Column()
  addr: string;

  @ManyToMany(() => Interface, (agentInterface) => agentInterface.machines)
  interfaces: Interface[];

  constructor(name: string, addr: string) {
    super();
    this.name = name;
    this.addr = addr;
  }
}
