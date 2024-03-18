import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';

@Module({
  providers: [AuthService],
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secretOrPrivateKey: configService.get<string>('JWT_TOKEN'),
        signOptions: { expiresIn: '3600' },
      })
    }),
  ],
  exports: [
    AuthService
  ]
})
export class AuthModule {}
