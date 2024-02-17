import { Injectable } from '@nestjs/common';
import { UserAccessService } from '../../access/services';
import { CreateUserAccessRequest } from '../../access/contract/users/create-user-access-request';
import { UserAccessModel } from '../../access/contract/users/user-access-model';
import { UserModel } from '../models/users/user-model';
import { CreateUserRequest } from '../models/users/create-user-request';

@Injectable()
export class UserManagerService {
  constructor(
    private userAccessService: UserAccessService
  ) { }

  public getUsers = async (): Promise<UserModel[]> => {
    const accessModelList = await this.userAccessService.getUsers();
    return accessModelList.map((x) => ({ ...x, _className: UserModel }));
  };

  public createUser = async (request: CreateUserRequest): Promise<UserModel> => {
    const accessModel = await this.userAccessService.createUser(new CreateUserAccessRequest(request.Email));
    return this.getUserModel(accessModel);
  };

  public getUserByEmail = async (email: string): Promise<UserModel> => {
    const accessModel = await this.userAccessService.getUserByEmail(email)
    return this.getUserModel(accessModel)
  };

  private getUserModel = (accessModel: UserAccessModel): UserModel => new UserModel(accessModel.Id, accessModel.Email, accessModel.DateCreated);
}
