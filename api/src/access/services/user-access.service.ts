import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { DbContextService } from './db-context.service';
import { TableEnum } from '../contract/table.enum';
import { CreateUserAccessRequest } from '../contract/users/create-user-access-request';
import { UserAccessModel } from '../contract/users/user-access-model';
import { UserEntity } from '../contract/entities/user.entity';
import { BadRequestException } from '../../controller/exceptions/bad-request.exception';

@Injectable()
export class UserAccessService {
  private userContext: SupabaseClient<any, 'public', any>;

  constructor(private dbContextService: DbContextService) {
    this.userContext = this.dbContextService.getConnection();
  }

  public getUsers = async (): Promise<UserAccessModel[]> => {
    const { data, error } = await this.userContext
      .from(TableEnum.Users)
      .select('*');
    if (error) throw new Error(error.message);
    return data.map(this.getUser);
  };

  public createUser = async (accessRequest: CreateUserAccessRequest): Promise<UserAccessModel> => {
    const { data, error } = await this.userContext
      .from(TableEnum.Users)
      .insert({
        'email': accessRequest.email,
        'datecreated': new Date(),
        'password': accessRequest.password
      })
      .select()
      .single<UserEntity>();
    if (error) {
      if (error.code === '23505') {
        throw new BadRequestException(error.details);
      }
      throw new Error(error.message);
    }
    return this.getUser(data);
  };

  public getUserByEmail = async (email: string): Promise<UserAccessModel> => {
    const { data, error } = await this.userContext
      .from(TableEnum.Users)
      .select()
      .eq('email', email)
      .single<UserEntity>();
    if (error) throw new Error(error.message);
    return this.getUser(data);
  };

  private getUser = (data: UserEntity): UserAccessModel => new UserAccessModel(
    data.id,
    data.email,
    data.datecreated
  );
}
