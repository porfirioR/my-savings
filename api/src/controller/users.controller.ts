import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserManagerService } from '../manager/services';
import { UserModel } from '../manager/models/users/user-model';
import { CreateUserRequest } from '../manager/models/users/create-user-request';
import { CreateUserApiRequest } from './models/users/create-user-api-request';

@Controller()
export class UsersController {
  constructor(private userManagerService: UserManagerService) { }

  @Get()
  async getUsers(): Promise<UserModel[]> {
    const modelList = await this.userManagerService.getUsers();
    return modelList;
  }

  @Get(':email')
  async getUserByEmail(@Param('email') email: string): Promise<UserModel> {
    const model = await this.userManagerService.getUserByEmail(email);
    return model;
  }

  @Post()
  async createUser(@Body() apiRequest: CreateUserApiRequest) {
    const request = new CreateUserRequest(apiRequest.Email)
    const model = await this.userManagerService.createUser(request);
    return model;
  }
}
