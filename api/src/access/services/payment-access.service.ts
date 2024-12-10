import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { DbContextService } from './db-context.service';
import { CreatePaymentAccessRequest } from '../contract/payments/create-payment-access-request';
import { DatabaseColumns, TableEnum } from 'src/utility/enums';
import { PaymentEntity } from '../contract/entities/payment.entity';
import { PaymentAccessModel } from '../contract/payments/payment-access-model';
import { UpdatePaymentAccessRequest } from '../contract/payments/update-payment-access-request';

@Injectable()
export class PaymentAccessService {
  private eventContext: SupabaseClient<any, 'public', any>;

  constructor(private dbContextService: DbContextService) {
    this.eventContext = this.dbContextService.getConnection();
  }

  public create = async (accessRequest: CreatePaymentAccessRequest): Promise<PaymentAccessModel> => {
    const eventEntity = this.mapAccessRequestToEntity(accessRequest);
    const event  = await this.eventContext
      .from(TableEnum.Payments)
      .insert(eventEntity)
      .select()
      .single<PaymentEntity>();
    if (event.error) throw new Error(event.error.message);
    return this.mapEntityToAccessModel(event.data);
  };

  public getMyPayments = async (authorId: number, id: number): Promise<PaymentAccessModel[]> => {
    const { data, error } = await this.eventContext
      .from(TableEnum.Payments)
      .select(DatabaseColumns.All)
      .eq(DatabaseColumns.AuthorId, authorId)
      .eq(DatabaseColumns.EntityId, id)
      .order('date', {ascending: false});
    if (error) throw new Error(error.message);
    return data?.map(this.mapEntityToAccessModel);
  };

  public updatePayment = async (accessRequest: UpdatePaymentAccessRequest): Promise<PaymentAccessModel> => {
    const eventEntity = this.mapAccessRequestToEntity(accessRequest);
    const event = await this.eventContext
      .from(TableEnum.Payments)
      .upsert(eventEntity)
      .select()
      .single<PaymentEntity>();
    if (event.error) throw new Error(event.error.message);
    return this.mapEntityToAccessModel(event.data);
  };

  private mapEntityToAccessModel = (entity: PaymentEntity): PaymentAccessModel => new PaymentAccessModel(
    entity.id,
    entity.amount,
    entity.date,
    entity.refund,
    entity.savingid
  );

  private mapAccessRequestToEntity = (accessRequest: CreatePaymentAccessRequest | UpdatePaymentAccessRequest) => {
    const eventEntity = new PaymentEntity(
      accessRequest.date,
      accessRequest.savingId,
      accessRequest.amount,
      accessRequest.refund
    );
    if (accessRequest instanceof UpdatePaymentAccessRequest) {
      eventEntity.id = accessRequest.id
    }
    return eventEntity
  };

}
