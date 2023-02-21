import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Sequence } from './sequence';
import { Step } from './step';

@Entity()
export class Test {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column()
  command: string;

  @ManyToOne(() => Step, (step) => step.tests)
  step: Step;
}
