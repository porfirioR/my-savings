import { Injectable } from '@nestjs/common';
import { ConfigurationAccessService } from '../../access/services';
import { TypeModel } from '../models/configurations/type-model';
import { TypeAccessModel } from '../../access/contract/types/type-access-model';
import { PeriodModel } from '../models/configurations/period-model';
import { PeriodAccessModel } from '../../access/contract/periods/period-access-model';
import { Configurations } from '../../utility/enums';

@Injectable()
export class ConfigurationManagerService {

  constructor(
    private readonly configurationAccessService: ConfigurationAccessService
  ) { }

  public getConfiguration = async (configuration: Configurations): Promise<TypeModel[] | PeriodModel[]> => {
    switch (configuration) {
      case Configurations.Periods:
        return this.getPeriods()
      case Configurations.Types:
        return this.getTypes()
      default:
        break;
    }
  }

  private getTypes = async (): Promise<TypeModel[]> => {
    const accessModelList = await this.configurationAccessService.getTypes();
    return accessModelList.map(this.mapAccessModelToModel)
  }

  private getPeriods = async (): Promise<PeriodModel[]> => {
    const accessModelList = await this.configurationAccessService.getPeriods();
    return accessModelList.map(this.mapPeriodAccessModelToModel)
  }

  private mapAccessModelToModel = (accessModel: TypeAccessModel) => new TypeModel(
    accessModel.id,
    accessModel.name,
    accessModel.description,
  )

  private mapPeriodAccessModelToModel = (accessModel: PeriodAccessModel) => new PeriodModel(
    accessModel.id,
    accessModel.name,
    accessModel.quantity,
  )

}
