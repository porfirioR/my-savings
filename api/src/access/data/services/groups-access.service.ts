import { Injectable } from '@nestjs/common';
import { BaseAccessService, DbContextService } from '.';
import { GroupEntity } from '../entities';
import { CreateGroupAccessRequest, GroupAccessModel, UpdateGroupAccessRequest } from '../../../access/contracts/groups';


@Injectable()
export class GroupsAccess extends BaseAccessService {
  constructor(dbContextService: DbContextService) {
    super(dbContextService);
  }

  private mapToModel(entity: GroupEntity): GroupAccessModel {
    return {
      id: entity.id,
      name: entity.name,
      startMonth: entity.start_month,
      startYear: entity.start_year,
      totalRuedas: entity.total_ruedas,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
    };
  }

  async findAll(): Promise<GroupAccessModel[]> {
    const { data, error } = await this.dbContext
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data as GroupEntity[]).map((e) => this.mapToModel(e));
  }

  async findById(id: string): Promise<GroupAccessModel> {
    const { data, error } = await this.dbContext
      .from('groups')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return this.mapToModel(data as GroupEntity);
  }

  async create(req: CreateGroupAccessRequest): Promise<GroupAccessModel> {
    const { data, error } = await this.dbContext
      .from('groups')
      .insert({
        name: req.name,
        start_month: req.startMonth,
        start_year: req.startYear,
        total_ruedas: 0,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapToModel(data as GroupEntity);
  }

  async update(id: string, req: UpdateGroupAccessRequest): Promise<GroupAccessModel> {
    const updatePayload: Partial<GroupEntity> = {};
    if (req.name !== undefined) updatePayload.name = req.name;
    if (req.startMonth !== undefined) updatePayload.start_month = req.startMonth;
    if (req.startYear !== undefined) updatePayload.start_year = req.startYear;
    if (req.totalRuedas !== undefined) updatePayload.total_ruedas = req.totalRuedas;

    const { data, error } = await this.dbContext
      .from('groups')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapToModel(data as GroupEntity);
  }

  async incrementTotalRuedas(id: string): Promise<void> {
    const current = await this.findById(id);
    const { error } = await this.dbContext
      .from('groups')
      .update({ total_ruedas: current.totalRuedas + 1 })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}
