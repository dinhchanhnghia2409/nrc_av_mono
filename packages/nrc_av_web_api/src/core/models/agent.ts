import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { AgentStatus } from '../enums';
import { Car } from './car';

@Entity()
export class Agent {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column()
  repoUrl: string;

  @Column()
  version: string;

  @Column({ default: AgentStatus.ACTIVE })
  status: AgentStatus;

  @OneToMany(() => Car, (car) => car.agent)
  cars: Car[];
}
