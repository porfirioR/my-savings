import { BadRequestException, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserManagerService } from '../../manager/services';
import { DatabaseColumns } from '../../utility/enums';

@Injectable()
export class ResetPasswordMiddleware implements NestMiddleware {
  constructor(private userManager: UserManagerService) { }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const email: string = req.body[DatabaseColumns.Email]
    const password: string = req.body[DatabaseColumns.Password]
    if (!password) {
      throw new BadRequestException('The password is required')
    }
    const code: string = req.body[DatabaseColumns.Code]
    if (!code) {
      throw new BadRequestException('The code is required')
    }
    const users = await this.userManager.getUsers()
    const validUser = users.find(x => x.email.toLocaleLowerCase() === email.toLocaleLowerCase())
    if (!validUser) {
      throw new BadRequestException('The mail is incorrect')
    }
    if (validUser.token !== code) {
      throw new BadRequestException('The code is invalid or has already been used')
    }
    next();
  }
}
