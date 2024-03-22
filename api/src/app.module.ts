import { ConfigModule } from '@nestjs/config';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ControllerModule } from './controller/controller.module';
import { SignupMiddleware } from './controller/middleware/signup.middleware';
import { LoginMiddleware } from './controller/middleware/login.middleware';

@Module({
  imports: [ConfigModule.forRoot(), ControllerModule, SignupMiddleware],
  controllers: [],
  providers: []
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoginMiddleware)
      .forRoutes({ path: 'users/login', method: RequestMethod.POST });

    consumer
      .apply(SignupMiddleware)
      .forRoutes({ path: 'users/sign-up', method: RequestMethod.POST });
  }
  
}
