import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrivateEndpointGuard } from '../guards/private-endpoint.guard';
import { TypeManagerService } from '../../manager/services';
import { TypeModel } from '../../manager/models/types/type-model';

@Controller('type')
@UseGuards(PrivateEndpointGuard)
export class TypeController {
  constructor(private savingManagerService: TypeManagerService) {}

  @Get()
  async getTypes(): Promise<TypeModel[]> {
    return await this.savingManagerService.getTypes();
  }
}
