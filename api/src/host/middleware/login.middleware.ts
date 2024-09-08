import { BadRequestException, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserManagerService } from '../../manager/services';

@Injectable()
export class LoginMiddleware implements NestMiddleware {
  constructor(private userManager: UserManagerService) { }
  async use(req: Request, res: Response, next: NextFunction) {
    const authorization: string = req.headers['authorization']
    if (!authorization.startsWith('Basic ')) {
      const invalidData: Record<string, string | number | Date | boolean | object> = {
        authorization: authorization,
        requestUrl: req.url,
        requestBaseUrl: req.baseUrl,
      }
      const invalidObject = JSON.stringify(invalidData)
      throw new UnauthorizedException(invalidObject)
    }
    const key = authorization.split('Basic ').at(1)
    const [email, password] = atob(key).split(':')
    const emails = (await this.userManager.getUsers()).map(x => x.email.toLocaleLowerCase())
    const isInvalid = !emails.includes(email.toLocaleLowerCase())
    if (isInvalid || password.length <= 8 ) {
      throw new BadRequestException('The email and/or password is incorrect')
    }
    next();
  }
}
