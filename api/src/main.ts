import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { config } from 'dotenv'
import { LOCAL_DEV, SPA_URL, SPA_URL2 } from './utility/constants'
import { ConfigService } from '@nestjs/config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService);
  
  app.setGlobalPrefix('api')
  app.enableCors({
    origin: [configService.get<string>(SPA_URL), configService.get<string>(SPA_URL2)]
  })
  const isLocalDev: boolean | undefined | null = configService.get<boolean>(LOCAL_DEV)
  if (isLocalDev) {
    await app.listen(3000)
  }
  config()
}
bootstrap()
