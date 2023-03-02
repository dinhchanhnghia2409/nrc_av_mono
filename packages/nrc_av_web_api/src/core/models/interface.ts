import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { Cmd } from './cmd';
import { Model } from './model';

@Entity()
export class Interface {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  agentName: string;

  @ManyToMany(() => Cmd, (cmd) => cmd.interfaces, { eager: true })
  @JoinTable({ name: 'cmdList' })
  cmds: Cmd[];

  @ManyToOne(() => Model, (model) => model.interfaces)
  model: Model;
}
