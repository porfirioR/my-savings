import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { UserManagerService } from '../../manager/services';
import { ForgotPasswordApiRequest } from '../models/users/forgot-password-api-request';

@Injectable()
export class ForgotPasswordEndpointGuard implements CanActivate {
  constructor(
    private readonly userManager: UserManagerService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const body: ForgotPasswordApiRequest = request.body
    const email = body.email
    if (!email) {
      return false
    }
    try {
      await this.userManager.getUserByEmail(email)
    } catch (error) {
      throw new BadRequestException(`The email: ${email}, does not exist or was deleted`)
    }
    return true
  }
}
