import { Body, Controller, Get, Headers, Post, UseGuards } from '@nestjs/common';
import { UserManagerService } from '../../manager/services';
import { UserModel } from '../../manager/models/users/user-model';
import { UserRequest } from '../../manager/models/users/user-request';
import { CreateUserApiRequest } from '../models/users/create-user-api-request';
import { Public } from '../decorators/public.decorator';
import { PrivateEndpointGuard } from '../guards/private-endpoint.guard';
import { DatabaseColumns } from '../../utility/enums';

@Controller('users')
@UseGuards(PrivateEndpointGuard)
export class UsersController {
  constructor(private userManagerService: UserManagerService) { }

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
  async registerUser(@Body() apiRequest: CreateUserApiRequest): Promise<UserModel> {
    const request = new UserRequest(apiRequest.email, apiRequest.password);
    const model = await this.userManagerService.registerUser(request);
    return model;
  }

  @Post('login')
  @Public()
  async login(@Headers('authorization') authorization: string): Promise<string> {
    const model = await this.userManagerService.loginUser(authorization);
    return model;
  }
}
