import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from 'src/core/models/test';
import { Agent, Car, Cmd, Interface, Model, Sequence, Step } from '../core';

export const DbModule = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('database.host'),
    port: Number(configService.get('database.port')),
    username: configService.get('database.username'),
    password: configService.get('database.password'),
    database: configService.get('database.name'),
    entities: [Car, Sequence, Step, Test, Model, Agent, Cmd, Interface],
    synchronize: true,
  }),
  inject: [ConfigService],
});
