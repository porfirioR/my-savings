import { BadRequestException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserManagerService } from '../../manager/services';

@Injectable()
export class SignupMiddleware implements NestMiddleware {
  constructor(private userManager: UserManagerService) { }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email: string = req.body['email']
      const password: string = req.body['password']
      if (!password) {
        throw new BadRequestException('The password is required')
      }
      const emails = (await this.userManager.getUsers()).map(x => x.email.toLocaleLowerCase())
      const isInvalid = emails.includes(email.toLocaleLowerCase())
      if (isInvalid) {
        throw new BadRequestException('The mail has already been registered')
      }
      next();
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).send(error.message)
    }
  }
}
