import { NestFactory, Reflector } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import { config } from 'dotenv'
import { PrivateEndpointGuard } from './host/guards/private-endpoint.guard'
import { JwtService } from '@nestjs/jwt'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const reflector = app.get(Reflector)
  app.useGlobalGuards(new PrivateEndpointGuard(reflector, new ConfigService(), new JwtService()))

  app.setGlobalPrefix('api')
  app.enableCors({
    origin: 'http://localhost:4200'
  })
  await app.listen(3000)
  config()
}
bootstrap()
