import { Module } from '@nestjs/common';
import { UsersController } from './services/users.controller';

@Module({
  imports: [],
  controllers: [
    UsersController
  ],
  providers: [],
})
export class ControllerModule {}
