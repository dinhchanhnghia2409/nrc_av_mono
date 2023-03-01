import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Machine {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column()
  addr: string;
}
