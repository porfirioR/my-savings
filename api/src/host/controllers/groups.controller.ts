import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { GroupsManager } from '../../manager/services';
import { GroupModel } from '../../manager/contracts/groups';
import { CreateGroupApiRequest, UpdateGroupApiRequest } from '../contracts/groups';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsManager: GroupsManager) {}

  @Get()
  async findAll(): Promise<GroupModel[]> {
    return this.groupsManager.findAll();
  }

  @Post()
  async create(@Body() body: CreateGroupApiRequest): Promise<GroupModel> {
    return this.groupsManager.create(body);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<GroupModel> {
    return this.groupsManager.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateGroupApiRequest,
  ): Promise<GroupModel> {
    return this.groupsManager.update(id, body);
  }
}
