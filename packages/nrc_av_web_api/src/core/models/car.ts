import joi from 'joi';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { CarStatus } from '../enums';
import { Agent } from './agent';
import { Model } from './model';

@Entity()
export class Car {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: false })
  macAddress: string;

  @Column({ nullable: false, unique: true })
  certKey: string;

  @Column()
  lastConnected: Date;

  @Column({ default: CarStatus.WAITING })
  status: CarStatus;

  @ManyToOne(() => Model, (model) => model.cars, { eager: true })
  model: Model;

  @ManyToOne(() => Agent, (agent) => agent.cars, { eager: true })
  agent: Agent;
}

export const carValidateSchema = {
  name: joi.string().min(0).max(40).trim(),
  macAddress: joi.string().min(0).max(40).trim()
};
