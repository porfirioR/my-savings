import { Injectable } from '@nestjs/common';
import { TypeAccessService } from '../../access/services';
import { TypeModel } from '../models/types/type-model';
import { TypeAccessModel } from '../../access/contract/types/type-access-model';

@Injectable()
export class TypeManagerService {

  constructor(
    private readonly typeAccessService: TypeAccessService
  ) { }

  public getTypes = async (): Promise<TypeModel[]> => {
    const accessModelList = await this.typeAccessService.getTypes();
    return accessModelList.map(this.mapAccessModelToModel)
  }

  private mapAccessModelToModel = (accessModel: TypeAccessModel) => new TypeModel(
    accessModel.id,
    accessModel.name,
    accessModel.description,
  )

}
