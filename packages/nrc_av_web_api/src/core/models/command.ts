import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseModel } from './base';
import { Interface } from './interface';

@Entity()
export class Command extends BaseModel {
  @Column()
  name: string;

  @Column()
  command: string;

  @Column({ nullable: true })
  nodes: string;

  @Column({ nullable: true })
  inclByDef: boolean;

  @Column({ nullable: true })
  autoStart: boolean;

  @Column({ nullable: true })
  autoRecord: boolean;

  @ManyToOne(() => Interface, (agentInterface) => agentInterface.commands)
  interface: Interface;

  constructor(
    name: string,
    command: string,
    nodes: string,
    inclByDef: boolean,
    autoStart: boolean,
    autoRecord: boolean
  ) {
    super();
    this.name = name;
    this.command = command;
    this.nodes = nodes;
    this.inclByDef = inclByDef;
    this.autoStart = autoStart;
    this.autoRecord = autoRecord;
  }
}
