import joi from 'joi';
import { Column, Entity, ManyToOne, OneToMany, JoinTable } from 'typeorm';
import { VehicleStatus } from '../enums';
import { Agent } from './agent';
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

  @ManyToOne(() => Model, (model) => model.vehicles)
  model: Model;

  @ManyToOne(() => Agent, (agent) => agent.vehicles)
  agent: Agent;

  @OneToMany(() => NodeList, (nodeList) => nodeList.vehicle)
  @JoinTable({ name: 'nodeList' })
  nodeList: NodeList[];
}

export const vehicleValidateSchema = {
  name: joi.string().min(0).max(40).trim(),
  macAddress: joi.string().min(0).max(40).trim()
};
