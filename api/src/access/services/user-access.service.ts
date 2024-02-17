import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { DbContextService } from './db-context.service';
import { TableEnum } from '../contract/table.enum';
import { CreateUserAccessRequest } from '../contract/users/create-user-access-request';
import { UserAccessModel } from '../contract/users/user-access-model';

@Injectable()
export class UserAccessService {
  private eventContext: SupabaseClient<any, 'public', any>;

  constructor(private dbContextService: DbContextService) {
    this.eventContext = this.dbContextService.getConnection();
  }

  public getUsers = async (): Promise<UserAccessModel[]> => {
    const { data, error } = await this.eventContext
      .from(TableEnum.Users)
      .select('*');
    if (error) throw new Error(error.message);
    return data?.map((x) => ({ ...x, _className: UserAccessModel }));
  };

  public createUser = async (accessRequest: CreateUserAccessRequest): Promise<UserAccessModel> => {
    const { error } = await this.eventContext
      .from(TableEnum.Users)
      .insert([accessRequest.Email]);
    if (error) throw new Error(error.message);
    return await this.getUserByEmail(accessRequest.Email);
  };

  public getUserByEmail = async (email: string): Promise<UserAccessModel> => {
    const { data, error } = await this.eventContext
      .from(TableEnum.Users)
      .select()
      .eq('Email', email)
      .single<UserAccessModel>();
    if (error) throw new Error(error.message);
    return data;
  };
}
