import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BaseRelationModel } from './baseRelation';
import { Destination } from './destination';
import { MultiDestination } from './multiDestination';

@Entity()
export class DestinationList extends BaseRelationModel {
  @PrimaryColumn()
  multi_destination_id: number;

  @PrimaryColumn()
  destination_id: number;

  @ManyToOne(() => Destination, (destination) => destination.id)
  @JoinColumn({ name: 'destination_id' })
  public destination: Destination;

  @ManyToOne(() => MultiDestination, (multiDestination) => multiDestination.id)
  @JoinColumn({ name: 'multi_destination_id' })
  public multiDestination: MultiDestination;

  constructor(destination: Destination, multiDestination: MultiDestination) {
    super();
    this.destination = destination;
    this.multiDestination = multiDestination;
  }
}
