import { Column, Entity, ManyToMany } from 'typeorm';
import { BaseModel } from './base';
import { Interface } from './interface';

@Entity()
export class Sensor extends BaseModel {
  @Column()
  name: string;

  @Column()
  errRate: number;

  @Column()
  warnRate: number;

  @Column()
  topicName: string;

  @Column()
  topicType: string;

  @ManyToMany(() => Interface, (agentInterface) => agentInterface.machines)
  interfaces: Interface[];

  constructor(
    name: string,
    errRate: number,
    warnRate: number,
    topicName: string,
    topicType: string
  ) {
    super();
    this.name = name;
    this.errRate = errRate;
    this.warnRate = warnRate;
    this.topicName = topicName;
    this.topicType = topicType;
  }
}
