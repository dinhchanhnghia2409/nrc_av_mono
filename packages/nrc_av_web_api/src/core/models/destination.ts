import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { BaseModel } from './base';
import { DestinationList } from './destinationList';
import { MultiDestination } from './multiDestination';

@Entity()
export class Destination extends BaseModel {
  @Column({ type: 'float' })
  posX: number;

  @Column({ type: 'float' })
  posY: number;

  @Column({ type: 'float' })
  posTh: number;

  @OneToMany(() => DestinationList, (destinationList) => destinationList.destination)
  destinationList: DestinationList[];

  @ManyToMany(() => MultiDestination, (multiDestination) => multiDestination.destinations)
  multiDestinations: MultiDestination[];

  constructor(posX: number, posY: number, posTh: number) {
    super();
    this.posX = posX;
    this.posY = posY;
    this.posTh = posTh;
  }
}
