import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SPA_URL, SPA_URL2 } from './utility/constants';

export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: [SPA_URL, SPA_URL2]
  })
  await app.init();
  return app;
}
