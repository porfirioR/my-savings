import { Injectable } from '@nestjs/common';
import { BaseAccessService, DbContextService } from '.';
import { MemberReplacementEntity, MemberReplacementScheduleEntity } from '../entities';
import {
  CreateMemberReplacementAccessRequest,
  CreateMemberReplacementScheduleAccessRequest,
  MemberReplacementAccessModel,
  MemberReplacementScheduleAccessModel,
} from '../../contracts/member-replacements';

type MemberJoin = { first_name: string; last_name: string } | null;
type RuedaJoin = { rueda_number: number } | null;

@Injectable()
export class MemberReplacementsAccess extends BaseAccessService {
  constructor(dbContextService: DbContextService) {
    super(dbContextService);
  }

  private mapToModel(
    entity: MemberReplacementEntity & {
      outgoing_member?: MemberJoin;
      incoming_member?: MemberJoin;
      ruedas?: RuedaJoin;
    },
  ): MemberReplacementAccessModel {
    return new MemberReplacementAccessModel(
      entity.id,
      entity.group_id,
      entity.rueda_id,
      entity.slot_position,
      entity.outgoing_member_id,
      entity.outgoing_monthly_amount,
      entity.incoming_member_id,
      entity.incoming_total_amount,
      entity.incoming_installments,
      entity.status,
      entity.created_at,
      entity.updated_at,
      entity.ruedas?.rueda_number,
      entity.outgoing_member ? `${entity.outgoing_member.first_name} ${entity.outgoing_member.last_name}` : undefined,
      entity.incoming_member ? `${entity.incoming_member.first_name} ${entity.incoming_member.last_name}` : undefined,
    );
  }

  private mapScheduleToModel(entity: MemberReplacementScheduleEntity): MemberReplacementScheduleAccessModel {
    return new MemberReplacementScheduleAccessModel(
      entity.id,
      entity.replacement_id,
      entity.month,
      entity.year,
      entity.installment_number,
      entity.outgoing_amount,
      entity.outgoing_paid,
      entity.outgoing_paid_at,
      entity.incoming_amount,
      entity.incoming_paid,
      entity.incoming_paid_at,
      entity.created_at,
      entity.updated_at,
    );
  }

  private readonly selectWithJoins =
    '*, outgoing_member:members!outgoing_member_id(first_name,last_name), incoming_member:members!incoming_member_id(first_name,last_name), ruedas(rueda_number)';

  async findByGroup(groupId: string): Promise<MemberReplacementAccessModel[]> {
    const { data, error } = await this.dbContext
      .from('member_replacements')
      .select(this.selectWithJoins)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data as any[]).map((e) => this.mapToModel(e));
  }

  async findById(id: string): Promise<MemberReplacementAccessModel> {
    const { data, error } = await this.dbContext
      .from('member_replacements')
      .select(this.selectWithJoins)
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return this.mapToModel(data as any);
  }

  async create(req: CreateMemberReplacementAccessRequest): Promise<MemberReplacementAccessModel> {
    const { data, error } = await this.dbContext
      .from('member_replacements')
      .insert({
        group_id: req.groupId,
        rueda_id: req.ruedaId,
        slot_position: req.slotPosition,
        outgoing_member_id: req.outgoingMemberId,
        outgoing_monthly_amount: req.outgoingMonthlyAmount,
        incoming_member_id: req.incomingMemberId,
        incoming_total_amount: req.incomingTotalAmount,
        incoming_installments: req.incomingInstallments,
        status: 'active',
      })
      .select()
      .single();

    this.throwIfError(error);
    return this.mapToModel(data as MemberReplacementEntity);
  }

  async createScheduleRows(rows: CreateMemberReplacementScheduleAccessRequest[]): Promise<MemberReplacementScheduleAccessModel[]> {
    const { data, error } = await this.dbContext
      .from('member_replacement_schedule')
      .insert(
        rows.map((r) => ({
          replacement_id: r.replacementId,
          month: r.month,
          year: r.year,
          installment_number: r.installmentNumber,
          outgoing_amount: r.outgoingAmount,
          incoming_amount: r.incomingAmount,
        })),
      )
      .select();

    this.throwIfError(error);
    return (data as MemberReplacementScheduleEntity[]).map((e) => this.mapScheduleToModel(e));
  }

  async findScheduleByReplacement(replacementId: string): Promise<MemberReplacementScheduleAccessModel[]> {
    const { data, error } = await this.dbContext
      .from('member_replacement_schedule')
      .select('*')
      .eq('replacement_id', replacementId)
      .order('year', { ascending: true })
      .order('month', { ascending: true });

    if (error) throw new Error(error.message);
    return (data as MemberReplacementScheduleEntity[]).map((e) => this.mapScheduleToModel(e));
  }

  async findScheduleById(id: string): Promise<MemberReplacementScheduleAccessModel> {
    const { data, error } = await this.dbContext
      .from('member_replacement_schedule')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return this.mapScheduleToModel(data as MemberReplacementScheduleEntity);
  }

  async markSchedule(id: string, side: 'outgoing' | 'incoming', paid: boolean): Promise<MemberReplacementScheduleAccessModel> {
    const update = side === 'outgoing'
      ? { outgoing_paid: paid, outgoing_paid_at: paid ? new Date().toISOString() : null }
      : { incoming_paid: paid, incoming_paid_at: paid ? new Date().toISOString() : null };

    const { data, error } = await this.dbContext
      .from('member_replacement_schedule')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapScheduleToModel(data as MemberReplacementScheduleEntity);
  }

  async updateScheduleAmount(id: string, side: 'outgoing' | 'incoming', amount: number): Promise<MemberReplacementScheduleAccessModel> {
    const update = side === 'outgoing' ? { outgoing_amount: amount } : { incoming_amount: amount };

    const { data, error } = await this.dbContext
      .from('member_replacement_schedule')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapScheduleToModel(data as MemberReplacementScheduleEntity);
  }

  async updateStatus(id: string, status: 'active' | 'completed'): Promise<void> {
    const { error } = await this.dbContext
      .from('member_replacements')
      .update({ status })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}
