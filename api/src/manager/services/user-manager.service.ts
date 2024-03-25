import { Injectable } from '@nestjs/common';
import { UserAccessService } from '../../access/services';
import { AuthService } from '../../auth/auth.service';
import { CreateUserAccessRequest } from '../../access/contract/users/create-user-access-request';
import { UserAccessModel } from '../../access/contract/users/user-access-model';
import { UserRequest } from '../models/users/user-request';
import { UserModel } from '../models/users/user-model';
import { AuthAccessRequest } from '../../auth/models/auth-access-request';
import { AuthUserModel } from '../../auth/models/auth-user-model';

@Injectable()
export class UserManagerService {
  constructor(
    private userAccessService: UserAccessService,
    private authService: AuthService
  ) { }

  public getUsers = async (): Promise<UserModel[]> => {
    const accessModelList = await this.userAccessService.getUsers();
    return accessModelList.map(x => this.getUserModel(x));
  };

  public registerUser = async (request: UserRequest): Promise<UserModel> => {
    const password = await this.authService.getHash(request.password)
    const accessModel = await this.userAccessService.createUser(new CreateUserAccessRequest(request.email, password));
    const authModel = new AuthUserModel(accessModel.id, accessModel.email, accessModel.password)
    const token = await this.authService.getToken(authModel)
    return this.getUserModel(accessModel, token);
  };

  public loginUser = async (request: string): Promise<string> => {
    const key = request.split('Basic ').at(1)
    const [email, password] = atob(key).split(':')
    const accessModel = await this.userAccessService.getUserByEmail(email);
    const authModel = new AuthUserModel(accessModel.id, accessModel.email, accessModel.password);
    await this.authService.checkUser(new AuthAccessRequest(email, password), authModel);
    const jwtToken = await this.authService.getToken(authModel);
    return jwtToken;
  };

  public getUserByEmail = async (email: string): Promise<UserModel> => {
    const accessModel = await this.userAccessService.getUserByEmail(email);
    return this.getUserModel(accessModel);
  };

  private getUserModel = (accessModel: UserAccessModel, token: string = ''): UserModel => new UserModel(accessModel.id, accessModel.email, accessModel.dateCreated, token);
}
