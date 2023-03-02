import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../core';
import { InterfaceController } from './interface.controller';
import { InterfaceService } from './interface.service';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [InterfaceController],
  providers: [InterfaceService]
})
export class InterfaceModule {}
