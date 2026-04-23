import { Injectable } from '@nestjs/common';
import { GroupAccessModel } from '../../access/contracts/groups';
import { GroupsAccess } from '../../access/data/services';
import { CreateGroupRequest, GroupModel, UpdateGroupRequest } from '../contracts/groups';

@Injectable()
export class GroupsManager {
  constructor(private readonly groupsAccess: GroupsAccess) {}

  private mapToModel(accessModel: GroupAccessModel): GroupModel {
    return {
      id: accessModel.id,
      name: accessModel.name,
      startMonth: accessModel.startMonth,
      startYear: accessModel.startYear,
      totalRuedas: accessModel.totalRuedas,
      createdAt: accessModel.createdAt,
      updatedAt: accessModel.updatedAt,
    };
  }

  async findAll(): Promise<GroupModel[]> {
    const result = await this.groupsAccess.findAll();
    return result.map((m) => this.mapToModel(m));
  }

  async findById(id: string): Promise<GroupModel> {
    const result = await this.groupsAccess.findById(id);
    return this.mapToModel(result);
  }

  async create(req: CreateGroupRequest): Promise<GroupModel> {
    const result = await this.groupsAccess.create(req);
    return this.mapToModel(result);
  }

  async update(id: string, req: UpdateGroupRequest): Promise<GroupModel> {
    const result = await this.groupsAccess.update(id, req);
    return this.mapToModel(result);
  }
}
