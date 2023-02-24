import { Module } from '@nestjs/common';
import { DatabaseModule } from '../core';
import { AuthModule } from '../auth/auth.module';
import { UserController } from './user.controller';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [UserController],
})
export class UserModule {}
