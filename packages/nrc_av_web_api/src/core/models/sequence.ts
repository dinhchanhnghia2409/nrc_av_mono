import {
  Column,
  Entity,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Step } from './step';

@Entity()
export class Sequence {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Step, (step) => step.sequence, { eager: true })
  @JoinTable()
  steps: Step[];
}
