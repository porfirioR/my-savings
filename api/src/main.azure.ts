import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { SPA_URL } from './utility/constants/environment.const';

export async function createApp() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const spaUrl = config.get<string>(SPA_URL);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: spaUrl ? spaUrl : '*',
  });

  await app.init();
  return app;
}
