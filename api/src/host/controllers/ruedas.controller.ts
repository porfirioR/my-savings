import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import {
  CreateRuedaApiRequest,
  UpdateRuedaApiRequest,
} from '../contracts/ruedas';
import { RuedaModel } from '../../manager/contracts/ruedas';
import { RuedasManager } from '../../manager/services';

@Controller('groups/:groupId/ruedas')
export class RuedasController {
  constructor(private readonly ruedasManager: RuedasManager) {}

  @Get()
  async findByGroup(@Param('groupId') groupId: string): Promise<RuedaModel[]> {
    return this.ruedasManager.findByGroup(groupId);
  }

  @Post()
  async create(
    @Param('groupId') groupId: string,
    @Body() body: CreateRuedaApiRequest,
  ): Promise<RuedaModel> {
    return this.ruedasManager.create({ ...body, groupId });
  }

  @Get('active')
  async findActive(@Param('groupId') groupId: string): Promise<RuedaModel | null> {
    return this.ruedasManager.findActive(groupId);
  }

  @Get('calculate-suggestion')
  async calculateSuggestion(@Param('groupId') groupId: string): Promise<{
    suggestedLoanAmount: number;
    cajaBalance: number;
    projectedMonthlyIncome: number;
  }> {
    return this.ruedasManager.calculateSuggestion(groupId);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<RuedaModel> {
    return this.ruedasManager.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateRuedaApiRequest,
  ): Promise<RuedaModel> {
    return this.ruedasManager.update(id, body);
  }
}
