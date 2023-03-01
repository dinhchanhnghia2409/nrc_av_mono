import { Module } from '@nestjs/common';
import { AgentModule } from './agent/agent.module';
import { ConfigModule } from '@nestjs/config';
import { configuration, DbModule } from './config';
import { CarModule } from './car/car.module';
import { ScheduleModule } from '@nestjs/schedule/dist';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ModelModule } from './model/model.module';
import { InterfaceModule } from './interface/interface.module';

@Module({
  imports: [
    AgentModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [configuration],
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    DbModule,
    CarModule,
    AuthModule,
    UserModule,
    ModelModule,
    InterfaceModule,
  ],
})
export class AppModule {}
