import { Injectable } from '@nestjs/common';
import { PaymentAccessModel } from '../../access/contracts/payments';
import { PaymentsAccess } from '../../access/data/services';
import { GeneratePaymentsRequest, MarkPaymentRequest, PaymentModel } from '../contracts/payments';

@Injectable()
export class PaymentsManager {
  constructor(private readonly paymentsAccess: PaymentsAccess) {}

  private mapToModel(accessModel: PaymentAccessModel): PaymentModel {
    return {
      id: accessModel.id,
      ruedaId: accessModel.ruedaId,
      memberId: accessModel.memberId,
      memberName: accessModel.memberName,
      month: accessModel.month,
      year: accessModel.year,
      installmentAmountDue: accessModel.installmentAmountDue,
      contributionAmountDue: accessModel.contributionAmountDue,
      totalAmountDue: accessModel.totalAmountDue,
      installmentNumber: accessModel.installmentNumber,
      paymentType: accessModel.paymentType,
      isPaid: accessModel.isPaid,
      paymentSource: accessModel.paymentSource,
      notes: accessModel.notes,
      createdAt: accessModel.createdAt,
      updatedAt: accessModel.updatedAt,
    };
  }

  async findByRuedaAndMonth(
    ruedaId: string,
    month: number,
    year: number,
  ): Promise<PaymentModel[]> {
    const result = await this.paymentsAccess.findByRuedaAndMonth(ruedaId, month, year);
    return result.map((m) => this.mapToModel(m));
  }

  async generateMonthlyPayments(req: GeneratePaymentsRequest): Promise<PaymentModel[]> {
    const result = await this.paymentsAccess.generateMonthlyPayments(req);
    return result.map((m) => this.mapToModel(m));
  }

  async markPayment(id: string, req: MarkPaymentRequest): Promise<PaymentModel> {
    const result = await this.paymentsAccess.markPayment(id, req);
    return this.mapToModel(result);
  }
}
