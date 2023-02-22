import { Module } from '@nestjs/common';
import { AgentModule } from './agent/agent.module';
import { ConfigModule } from '@nestjs/config';
import { configuration, DbModule } from './config';
import { CarModule } from './car/car.module';
import { SequenceModule } from './sequence/sequence.module';
import { ScheduleModule } from '@nestjs/schedule/dist';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AgentModule,
    ConfigModule.forRoot({
      envFilePath: '.env.development',
      load: [configuration],
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    DbModule,
    CarModule,
    SequenceModule,
    AuthModule,
  ],
})
export class AppModule {}
