import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BaseRelationModel } from './baseRelation';
import { Destination } from './destination';
import { Interface } from './interface';

@Entity()
export class InterfaceDestination extends BaseRelationModel {
  @PrimaryColumn()
  interface_id: number;

  @PrimaryColumn()
  destination_id: number;

  @ManyToOne(() => Interface, (agentInterface) => agentInterface.id)
  @JoinColumn({ name: 'interface_id' })
  public interface: Interface;

  @ManyToOne(() => Destination, (destination) => destination.id, { cascade: true })
  @JoinColumn({ name: 'destination_id' })
  public destination: Destination;

  @Column()
  name: string;

  constructor(name: string, destination: Destination, agentInterface: Interface) {
    super();
    this.name = name;
    this.destination = destination;
    this.interface = agentInterface;
  }
}