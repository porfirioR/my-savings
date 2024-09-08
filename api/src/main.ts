import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { config } from 'dotenv'
import { SPA_URL, SPA_URL2 } from './utility/constants'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api')
  app.enableCors({
    origin: [SPA_URL, SPA_URL2]

  })
  await app.listen(3000)
  config()
}
bootstrap()
