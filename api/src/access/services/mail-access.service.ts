import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ForgotPasswordAccessRequest } from '../contract/users/forgot-password-access-request';
import { ConfigService } from '@nestjs/config';
import { SPA_URL } from '../../utility/constants';

@Injectable()
export class MailAccessService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService
  ) {}

  public async forgotPassword(request: ForgotPasswordAccessRequest) {
    const url = `${this.configService.get<string>(SPA_URL)}/reset-password`
    const template = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Forgot your Password</title>
        </head>
        <body>
          <h1>Reset your Password</h1>
          <h3>Hey ${request.email} the code to reset your password is: </h3>
          <p><b>${request.code}</b></p>

          <p>Please click go to <b>${url}</b> to reset your password or click below to redirect</p>
          <a href="${url}?code=${request.code}" target="_blank" rel="reset password">Reset Password</a>

          <p>If you did not request this email you can safely ignore it.</p>
        </body>
      </html>
    `;
    return this.mailerService.sendMail({
      to: request.email,
      subject: 'Email',
      html: template
    });
  }
}
