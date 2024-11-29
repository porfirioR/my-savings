import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { DbContextService } from './db-context.service';
import { CreatePaymentAccessRequest } from '../contract/payments/create-payment-access-request';
import { TableEnum } from 'src/utility/enums';
import { PaymentEntity } from '../contract/entities/payment.entity';
import { PaymentAccessModel } from '../contract/payments/payment-access-model';

@Injectable()
export class PaymentAccessService {
  private eventContext: SupabaseClient<any, 'public', any>;

  constructor(private dbContextService: DbContextService) {
    this.eventContext = this.dbContextService.getConnection();
  }

  
  public create = async (accessRequest: CreatePaymentAccessRequest): Promise<PaymentAccessModel> => {
    const eventEntity = this.getEntity(accessRequest);
    const event  = await this.eventContext
      .from(TableEnum.Payments)
      .insert(eventEntity)
      .select()
      .single<PaymentEntity>();
    if (event.error) throw new Error(event.error.message);
    return this.getPaymentAccessModel(event.data);
  };

  private getPaymentAccessModel = (accessRequest: PaymentEntity): PaymentAccessModel => new PaymentAccessModel(
    accessRequest.id,
    accessRequest.amount,
    accessRequest.date,
    accessRequest.refund,
    accessRequest.savingId
  );

  private getEntity = (accessRequest: CreatePaymentAccessRequest) => {
    const eventEntity = new PaymentEntity(
      accessRequest.date,
      accessRequest.savingid,
      accessRequest.amount,
      accessRequest.refund,
      accessRequest.savingId
    );
    return eventEntity
  };
}
