import { BadRequestException, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserManagerService } from 'src/manager/services';

@Injectable()
export class LoginMiddleware implements NestMiddleware {
  constructor(private userManager: UserManagerService) { }
  async use(req: Request, res: Response, next: NextFunction) {
    const authorization: string = req.headers['authorization']
    if (!authorization.startsWith('basic ')) {
      throw new UnauthorizedException()
    }
    const [email, password] = atob(authorization.substring(authorization.indexOf('basic '))).split(':')
    const emails = (await this.userManager.getUsers()).map(x => x.email.toLocaleLowerCase())
    const isInvalid = !emails.includes(email.toLocaleLowerCase())
    if (isInvalid || password.length <= 8 ) {
      throw new BadRequestException('The email and/or password is incorrect')
    }
    next();
  }
}
