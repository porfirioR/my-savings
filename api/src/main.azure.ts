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

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: spaUrl ? spaUrl.split(',').map((u) => u.trim()) : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.init();
  return app;
}
