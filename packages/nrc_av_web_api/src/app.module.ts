import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule/dist';
import { AgentModule } from './agent/agent.module';
import { AuthModule } from './auth/auth.module';
import { CarModule } from './car/car.module';
import { configuration, DbModule } from './config';
import { InterfaceModule } from './interface/interface.module';
import { ModelModule } from './model/model.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    AgentModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [configuration],
      isGlobal: true
    }),
    ScheduleModule.forRoot(),
    DbModule,
    CarModule,
    AuthModule,
    UserModule,
    ModelModule,
    InterfaceModule
  ]
})
export class AppModule {}
