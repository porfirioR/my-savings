import { Body, Controller, Get, Headers, Post, UseGuards } from '@nestjs/common';
import { MailManagerService, UserManagerService } from '../../manager/services';
import { ResetUserPasswordRequest, SignModel, UserModel, UserRequest, WebPushModel, WebPushRequest } from '../../manager/models/users';
import { CreateUserApiRequest } from '../models/users/create-user-api-request';
import { Public } from '../decorators/public.decorator';
import { PrivateEndpointGuard } from '../guards/private-endpoint.guard';
import { ForgotPasswordEndpointGuard } from '../guards/forgot-password-endpoint.guard';
import { DatabaseColumns } from '../../utility/enums';
import { ResetUserPasswordApiRequest } from '../models/users/reset-user-password-api-request';
import { ForgotPasswordApiRequest } from '../models/users/forgot-password-api-request';
import { WebPushApiRequest } from '../models/users/web-push-api-request';

@Controller('users')
@UseGuards(PrivateEndpointGuard)
export class UsersController {
  constructor(private userManagerService: UserManagerService,
    private mailManagerService: MailManagerService
  ) { }

  @Get('admin')
  async getUsers(): Promise<UserModel[]> {
    const modelList = await this.userManagerService.getUsers();
    return modelList;
  }

  @Get()
  async getUserByEmail(@Headers(DatabaseColumns.Email) email: string): Promise<UserModel> {
    const model = await this.userManagerService.getUserByEmail(email);
    return model;
  }

  @Post('sign-up')
  @Public()
  async registerUser(@Body() apiRequest: CreateUserApiRequest): Promise<SignModel> {
    const request = new UserRequest(apiRequest.email, apiRequest.password);
    const model = await this.userManagerService.registerUser(request);
    return model;
  }

  @Post('login')
  @Public()
  async login(@Headers('authorization') authorization: string): Promise<SignModel> {
    const model = await this.userManagerService.loginUser(authorization);
    return model;
  }

  @Post('forgot-password')
  @Public()
  @UseGuards(ForgotPasswordEndpointGuard)
  async forgotPassword(@Body() apiRequest: ForgotPasswordApiRequest): Promise<boolean> {
    const model = await this.mailManagerService.forgotPassword(apiRequest.email);
    return model;
  }

  @Post('reset-password')
  @Public()
  async resetPassword(@Body() apiRequest: ResetUserPasswordApiRequest): Promise<SignModel> {
    const request = new ResetUserPasswordRequest(apiRequest.email, apiRequest.newPassword, apiRequest.code)
    const model = await this.userManagerService.resetUserPassword(request)
    return model
  }

  @Post('save-token')
  @Public()
  async saveKey(@Body() apiRequest: WebPushApiRequest): Promise<WebPushModel> {
    const request = new WebPushRequest(apiRequest.endpoint, apiRequest.expirationTime, apiRequest.keys)
    const model = await this.userManagerService.saveToken(request)
    return model
  }
}
