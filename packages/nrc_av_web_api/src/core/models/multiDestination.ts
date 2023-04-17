import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BaseModel } from './base';
import { Destination } from './destination';
import { Interface } from './interface';

@Entity()
export class MultiDestination extends BaseModel {
  @Column()
  name: string;

  @ManyToMany(() => Destination, (destination) => destination.multiDestinations)
  @JoinTable({ name: 'destinationMultiDestination' })
  destinations: Destination[];

  @ManyToMany(() => Interface, (agentInterface) => agentInterface.multiDestinations)
  interfaces: Interface[];

  constructor(name: string) {
    super();
    this.name = name;
  }
}
