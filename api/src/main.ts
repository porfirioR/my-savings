import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { SPA_URL, PORT } from './utility/constants/environment.const';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const spaUrl = config.get<string>(SPA_URL);
  const port = config.get<number>(PORT) ?? 3000;

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: spaUrl ? spaUrl.split(',').map((x) => x.trim()) : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(port);
  console.log(`API running on port ${port} — CORS origin: ${spaUrl ?? '*'}`);
}
bootstrap();
