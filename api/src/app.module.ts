import { ConfigModule } from '@nestjs/config';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ControllerModule } from './controller/controller.module';
import { LoginMiddleware } from './controller/middleware/login.middleware';

@Module({
  imports: [ConfigModule.forRoot(), ControllerModule, LoginMiddleware],
  controllers: [],
  providers: []
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoginMiddleware)
      .forRoutes({ path: 'users', method: RequestMethod.POST });
  }
  
}
