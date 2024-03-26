import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserManagerService } from '../../manager/services';
import { DatabaseColumns } from '../../utility/enums';

@Injectable()
export class SignupMiddleware implements NestMiddleware {
  constructor(private userManager: UserManagerService) { }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const email: string = req.body[DatabaseColumns.Email]
    const password: string = req.body[DatabaseColumns.Password]
    if (!password) {
      throw new BadRequestException('The password is required')
    }
    const emails = (await this.userManager.getUsers()).map(x => x.email.toLocaleLowerCase())
    const isInvalid = emails.includes(email.toLocaleLowerCase())
    if (isInvalid) {
      throw new BadRequestException('The mail has already been registered')
    }
    next();
  }
}
