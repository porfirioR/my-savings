import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserManagerService } from '../../manager/services';
import { BadRequestException } from '../exceptions/bad-request.exception';

@Injectable()
export class LoginMiddleware implements NestMiddleware {
  constructor(private userManager: UserManagerService) { }

  async use(req: Request, res: Response, next: NextFunction) {
    const email: string = req.body['email']
    const emails = (await this.userManager.getUsers()).map(x => x.email.toLocaleLowerCase())
    const isInvalid = emails.includes(email.toLocaleLowerCase())
    if (isInvalid) {
      throw new BadRequestException('The mail has already been registered')
    }
    next();
  }
}
