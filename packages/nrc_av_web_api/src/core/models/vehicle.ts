import { Column, Entity, ManyToOne, OneToMany, JoinTable } from 'typeorm';
import { VehicleStatus } from '../enums';
import { BaseModel } from './base';
import { Model } from './model';
import { NodeList } from './nodeList';

@Entity()
export class Vehicle extends BaseModel {
  @Column({ nullable: true })
  name: string;

  @Column({ nullable: false })
  macAddress: string;

  @Column({ nullable: false, unique: true })
  certKey: string;

  @Column({ nullable: false, default: false })
  isOnline: boolean;

  @Column()
  lastConnected: Date;

  @Column({ default: VehicleStatus.WAITING })
  status: VehicleStatus;

  @Column({ default: null })
  agentVersion: string;

  @ManyToOne(() => Model, (model) => model.vehicles)
  model: Model;

  @OneToMany(() => NodeList, (nodeList) => nodeList.vehicle)
  @JoinTable({ name: 'nodeList' })
  nodeList: NodeList[];
}
