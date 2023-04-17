import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { Algorithm } from './algorithms';
import { BaseModel } from './base';
import { Command } from './command';
import { DestinationList } from './destinationList';
import { Machine } from './machine';
import { Model } from './model';
import { MultiDestination } from './multiDestination';
import { Sensor } from './sensor';

@Entity()
export class Interface extends BaseModel {
  @Column()
  name: string;

  @Column()
  agentName: string;

  @ManyToOne(() => Model, (model) => model.interfaces)
  model: Model;

  @ManyToMany(() => Machine, (machine) => machine.interfaces)
  @JoinTable({ name: 'machineList' })
  machines: Machine[];

  @ManyToMany(() => Sensor, (sensor) => sensor.interfaces)
  @JoinTable({ name: 'sensorList' })
  sensors: Sensor[];

  @ManyToMany(() => Algorithm, (algorithm) => algorithm.interfaces)
  @JoinTable({ name: 'algorithmsList' })
  algorithms: Algorithm[];

  @ManyToMany(() => Command, (command) => command.interfaces)
  @JoinTable({ name: 'commandsList' })
  commands: Command[];

  @ManyToMany(() => MultiDestination, (multiDestination) => multiDestination.interfaces)
  @JoinTable({ name: 'multiDestinationList' })
  multiDestinations: MultiDestination[];

  @OneToMany(() => DestinationList, (destinationList) => destinationList.interface)
  destinationLists: DestinationList[];

  constructor(agentName: string, name: string) {
    super();
    this.agentName = agentName;
    this.name = name;
  }
}
