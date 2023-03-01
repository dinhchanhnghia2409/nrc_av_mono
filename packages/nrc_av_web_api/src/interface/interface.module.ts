import { Module } from '@nestjs/common';
import { DatabaseModule } from '../core';
import { AuthModule } from '../auth/auth.module';
import { InterfaceController } from './interface.controller';
import { InterfaceService } from './interface.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [InterfaceController],
  providers: [InterfaceService],
})
export class InterfaceModule {}
