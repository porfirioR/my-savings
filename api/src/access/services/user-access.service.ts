import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { DbContextService } from './db-context.service';
import { CreateUserAccessRequest } from '../contract/users/create-user-access-request';
import { UserAccessModel } from '../contract/users/user-access-model';
import { UserEntity } from '../contract/entities/user.entity';
import { TableEnum, DatabaseColumns } from '../../utility/enums';

@Injectable()
export class UserAccessService {
  private userContext: SupabaseClient<any, 'public', any>;
  private databaseColumns = DatabaseColumns

  constructor(private dbContextService: DbContextService) {
    this.userContext = this.dbContextService.getConnection();
  }

  public getUsers = async (): Promise<UserAccessModel[]> => {
    const { data, error } = await this.userContext
      .from(TableEnum.Users)
      .select(this.databaseColumns.All);
    if (error) throw new Error(error.message);
    return data.map(this.getUser);
  };

  public createUser = async (accessRequest: CreateUserAccessRequest): Promise<UserAccessModel> => {
    const insertValue: Record<string, string | Date> = {
      [this.databaseColumns.Email]: accessRequest.email,
      [this.databaseColumns.DateCreated]: new Date(),
      [this.databaseColumns.Password]: accessRequest.password
    };
    const { data, error } = await this.userContext
      .from(TableEnum.Users)
      .insert(insertValue)
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
      .eq(this.databaseColumns.Email, email)
      .single<UserEntity>();
    if (error) throw new Error(error.message);
    return this.getUser(data);
  };

  private getUser = (data: UserEntity): UserAccessModel => new UserAccessModel(
    data.id,
    data.email,
    data.datecreated,
    data.password
  );
}
