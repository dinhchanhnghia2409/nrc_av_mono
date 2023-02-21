import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OSType } from '../enums';
import { Car } from './car';
import { Interface } from './interface';

@Entity()
export class Model {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column()
  year: number;

  @Column({ default: OSType.LINUX })
  osType: OSType;

  @Column()
  osVersion: string;

  @OneToMany(() => Car, (car) => car.model)
  cars: Car[];

  @OneToMany(() => Interface, (interfaces) => interfaces.model, { eager: true })
  interfaces: Interface[];
}
