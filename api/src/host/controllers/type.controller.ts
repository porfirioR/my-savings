import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PrivateEndpointGuard } from '../guards/private-endpoint.guard';
import { ConfigurationManagerService } from '../../manager/services';
import { TypeModel } from '../../manager/models/configurations/type-model';
import { PeriodModel } from '../../manager/models/configurations/period-model';
import { Configurations } from '../../utility/enums';

@Controller('configurations')
@UseGuards(PrivateEndpointGuard)
export class ConfigurationController {
  constructor(private configurationManagerService: ConfigurationManagerService) {}

  @Get(':configuration')
  async getTypes(@Param('configuration') configuration: Configurations): Promise<TypeModel[] | PeriodModel[]> {
    return await this.configurationManagerService.getConfiguration(configuration);
  }
}
