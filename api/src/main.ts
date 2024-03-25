import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { PrivateEndpointGuard } from './controller/guards/private-endpoint.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new PrivateEndpointGuard(reflector));

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: "http://localhost:4200"
  });
  await app.listen(3000);
  config();
}
bootstrap();
