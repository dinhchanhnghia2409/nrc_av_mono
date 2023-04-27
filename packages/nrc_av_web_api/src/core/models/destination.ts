import { Column, Entity, OneToMany } from 'typeorm';
import { BaseModel } from './base';
import { DestinationList } from './destinationList';
import { InterfaceDestination } from './interfaceDestination';

@Entity()
export class Destination extends BaseModel {
  @Column({ type: 'float' })
  posX: number;

  @Column({ type: 'float' })
  posY: number;

  @Column({ type: 'float' })
  posTh: number;

  @OneToMany(() => InterfaceDestination, (interfaceDestination) => interfaceDestination.destination)
  interfaceDestination: InterfaceDestination[];

  @OneToMany(() => DestinationList, (destinationList) => destinationList.destination)
  destinationList: DestinationList;

  constructor(posX: number, posY: number, posTh: number) {
    super();
    this.posX = posX;
    this.posY = posY;
    this.posTh = posTh;
  }
}
