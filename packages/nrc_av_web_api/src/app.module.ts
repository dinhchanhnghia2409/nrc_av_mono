import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AgentModule } from './agent/agent.module';
import { AuthModule } from './auth/auth.module';
import { configuration, DbModule } from './config';
import { InterfaceModule } from './interface/interface.module';
import { UserModule } from './user/user.module';
import { VehicleModule } from './vehicle/vehicle.module';

@Module({
  imports: [
    AgentModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [configuration],
      isGlobal: true
    }),
    DbModule,
    VehicleModule,
    AuthModule,
    UserModule,
    EventEmitterModule.forRoot(),
    InterfaceModule
  ]
})
export class AppModule {}
