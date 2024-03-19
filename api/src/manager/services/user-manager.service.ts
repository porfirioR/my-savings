import { Injectable } from '@nestjs/common';
import { UserAccessService } from '../../access/services';
import { AuthService } from '../../auth/auth.service';
import { CreateUserAccessRequest } from '../../access/contract/users/create-user-access-request';
import { UserAccessModel } from '../../access/contract/users/user-access-model';
import { CreateUserRequest } from '../models/users/create-user-request';
import { UserModel } from '../models/users/user-model';

@Injectable()
export class UserManagerService {
  constructor(
    private userAccessService: UserAccessService,
    private authService: AuthService
  ) { }

  public getUsers = async (): Promise<UserModel[]> => {
    const accessModelList = await this.userAccessService.getUsers();
    return accessModelList.map((x) => ({ ...x, _className: UserModel }));
  };

  public createUser = async (request: CreateUserRequest): Promise<UserModel> => {
    const password = await this.authService.getHash(request.password)
    const accessModel = await this.userAccessService.createUser(new CreateUserAccessRequest(request.email, password));
    return this.getUserModel(accessModel);
  };

  public getUserByEmail = async (email: string): Promise<UserModel> => {
    const accessModel = await this.userAccessService.getUserByEmail(email)
    return this.getUserModel(accessModel)
  };

  private getUserModel = (accessModel: UserAccessModel): UserModel => new UserModel(accessModel.id, accessModel.email, accessModel.dateCreated);
}
