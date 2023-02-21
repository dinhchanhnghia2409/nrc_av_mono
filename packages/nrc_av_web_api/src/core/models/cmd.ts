import { Column, Entity, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Interface } from './interface';

@Entity()
export class Cmd {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  command: string;

  @Column({ nullable: true })
  nodes: string;

  @Column({ nullable: true })
  inclByDef: boolean;

  @ManyToMany(() => Interface, (interfaces) => interfaces.cmds)
  interfaces: Interface[];
}
