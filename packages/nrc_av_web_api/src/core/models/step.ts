import {
  Column,
  Entity,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Sequence } from './sequence';
import { Test } from './test';

@Entity()
export class Step {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column()
  command: string;

  @ManyToOne(() => Sequence, (sequence) => sequence.steps)
  sequence: Sequence;

  @OneToMany(() => Test, (test) => test.step)
  @JoinTable()
  tests: Promise<Test[]>;
}
