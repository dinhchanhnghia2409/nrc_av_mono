import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InterfaceController } from './interface.controller';
import { InterfaceService } from './interface.service';

@Module({
  imports: [AuthModule],
  providers: [InterfaceService],
  exports: [InterfaceService],
  controllers: [InterfaceController]
})
export class InterfaceModule {}
