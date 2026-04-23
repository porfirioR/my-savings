import { Injectable } from '@nestjs/common';
import { BaseAccessService, DbContextService } from '.';
import { CreateMemberAccessRequest, ExitMemberAccessRequest, MemberAccessModel, UpdateMemberAccessRequest } from '../../../access/contracts/members';
import { MemberEntity } from '../entities';

@Injectable()
export class MembersAccess extends BaseAccessService {
  constructor(dbContextService: DbContextService) {
    super(dbContextService);
  }

  private mapToModel(entity: MemberEntity): MemberAccessModel {
    return {
      id: entity.id,
      groupId: entity.group_id,
      firstName: entity.first_name,
      lastName: entity.last_name,
      phone: entity.phone,
      position: entity.position,
      isActive: entity.is_active,
      joinedMonth: entity.joined_month,
      joinedYear: entity.joined_year,
      leftMonth: entity.left_month,
      leftYear: entity.left_year,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
    };
  }

  async findByGroup(groupId: string): Promise<MemberAccessModel[]> {
    const { data, error } = await this.dbContext
      .from('members')
      .select('*')
      .eq('group_id', groupId)
      .order('position', { ascending: true });

    if (error) throw new Error(error.message);
    return (data as MemberEntity[]).map((e) => this.mapToModel(e));
  }

  async findById(id: string): Promise<MemberAccessModel> {
    const { data, error } = await this.dbContext
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return this.mapToModel(data as MemberEntity);
  }

  async create(req: CreateMemberAccessRequest): Promise<MemberAccessModel> {
    const { data, error } = await this.dbContext
      .from('members')
      .insert({
        group_id: req.groupId,
        first_name: req.firstName,
        last_name: req.lastName,
        phone: req.phone ?? null,
        position: req.position,
        is_active: true,
        joined_month: req.joinedMonth,
        joined_year: req.joinedYear,
        left_month: null,
        left_year: null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapToModel(data as MemberEntity);
  }

  async update(id: string, req: UpdateMemberAccessRequest): Promise<MemberAccessModel> {
    const updatePayload: Partial<MemberEntity> = {};
    if (req.firstName !== undefined) updatePayload.first_name = req.firstName;
    if (req.lastName !== undefined) updatePayload.last_name = req.lastName;
    if (req.phone !== undefined) updatePayload.phone = req.phone;
    if (req.position !== undefined) updatePayload.position = req.position;
    if (req.isActive !== undefined) updatePayload.is_active = req.isActive;
    if (req.joinedMonth !== undefined) updatePayload.joined_month = req.joinedMonth;
    if (req.joinedYear !== undefined) updatePayload.joined_year = req.joinedYear;

    const { data, error } = await this.dbContext
      .from('members')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapToModel(data as MemberEntity);
  }

  async processExit(id: string, req: ExitMemberAccessRequest): Promise<MemberAccessModel> {
    const { data, error } = await this.dbContext
      .from('members')
      .update({
        is_active: false,
        left_month: req.leftMonth,
        left_year: req.leftYear,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapToModel(data as MemberEntity);
  }
}
