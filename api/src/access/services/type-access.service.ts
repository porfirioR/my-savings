import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { DbContextService } from './db-context.service';
import { TableEnum, DatabaseColumns } from '../../utility/enums';
import { TypeAccessModel } from '../contract/types/type-access-model';
import { TypeEntity } from '../contract/entities/type.entity';

@Injectable()
export class TypeAccessService {
  private eventContext: SupabaseClient<any, 'public', any>;

  constructor(private dbContextService: DbContextService) {
    this.eventContext = this.dbContextService.getConnection();
  }

  public getTypes = async (): Promise<TypeAccessModel[]> => {
    const { data, error } = await this.eventContext
      .from(TableEnum.Types)
      .select(DatabaseColumns.All)
    if (error) throw new Error(error.message);
    return data?.map(this.getTypeAccessModel);
  };

  private getTypeAccessModel = (accessRequest: TypeEntity): TypeAccessModel => new TypeAccessModel(
    accessRequest.id,
    accessRequest.name,
    accessRequest.description
  );

}
