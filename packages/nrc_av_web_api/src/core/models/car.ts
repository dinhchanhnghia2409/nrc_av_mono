import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { CarConnectionType, CarStatus } from '../enums';
import { Agent } from './agent';
import { Model } from './model';

@Entity()
export class Car {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  macAddress: string;

  @Column()
  licenseNumber: string;

  @Column()
  certKey: string;

  @Column({ default: CarConnectionType.WIFI })
  connectionType: string;

  @Column()
  lastConnected: Date;

  @Column({ default: CarStatus.WAITING })
  status: CarStatus;

  @ManyToOne(() => Model, (model) => model.cars, { eager: true })
  model: Model;

  @ManyToOne(() => Agent, (agent) => agent.cars, { eager: true })
  agent: Agent;
}
