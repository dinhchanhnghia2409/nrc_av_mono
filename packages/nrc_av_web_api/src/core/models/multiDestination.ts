import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseModel } from './base';
import { DestinationList } from './destinationList';
import { Interface } from './interface';

@Entity()
export class MultiDestination extends BaseModel {
  @Column()
  name: string;

  @OneToMany(() => DestinationList, (destinationList) => destinationList.multiDestination)
  destinationList: DestinationList[];

  @ManyToOne(() => Interface, (agentInterface) => agentInterface.multiDestinations)
  interface: Interface;

  constructor(name: string) {
    super();
    this.name = name;
  }
}
