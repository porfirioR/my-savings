import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DbContextService, EventAccessService, EventFollowAccessService, MailAccessService, PaymentAccessService, SavingAccessService, UserAccessService } from './services';
import { AuthModule } from '../auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { MAIL_HOST, MAIL_PASSWORD, MAIL_USER } from '../utility/constants';

@Module({
  imports: [
    AuthModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>(MAIL_HOST),
          port: 587,
          ignoreTLS: true,
          secure: false,
          auth: {
            user: configService.get<string>(MAIL_USER),
            pass: configService.get<string>(MAIL_PASSWORD),
          },
        },
        defaults: {
          from: '"My Events" noreply@my-events.com',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [
    ConfigService,
    DbContextService,
    EventAccessService,
    EventFollowAccessService,
    UserAccessService,
    MailAccessService,
    PaymentAccessService,
    SavingAccessService
  ],
  exports: [
    EventAccessService,
    EventFollowAccessService,
    UserAccessService,
    MailAccessService,
    PaymentAccessService,
    SavingAccessService,
  ]
})
export class AccessModule {}
