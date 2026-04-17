import { Injectable } from '@nestjs/common';
import { PaymentAccessModel } from '../../access/contracts/payments';
import { PaymentsAccess } from '../../access/data/services';
import { GeneratePaymentsRequest, MarkPaymentRequest, PaymentModel } from '../contracts/payments';
import { CashBoxManager } from './cash-box-manager.service';
import { CreateCashMovementRequest } from '../contracts/cash-box';

@Injectable()
export class PaymentsManager {
  constructor(
    private readonly paymentsAccess: PaymentsAccess,
    private readonly cashBoxManager: CashBoxManager,
  ) {}

  private mapToModel(accessModel: PaymentAccessModel): PaymentModel {
    return {
      id: accessModel.id,
      ruedaId: accessModel.ruedaId,
      memberId: accessModel.memberId,
      memberName: accessModel.memberName,
      month: accessModel.month,
      year: accessModel.year,
      installmentAmount: accessModel.installmentAmountDue,
      contributionAmount: accessModel.contributionAmountDue,
      totalAmount: accessModel.totalAmountDue,
      installmentNumber: accessModel.installmentNumber,
      paymentType: accessModel.paymentType,
      status: accessModel.isPaid ? 'paid' : 'pending',
      paidAt: accessModel.paidAt,
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

    // After marking paid, check if all payments for this month are now complete
    if (req.isPaid) {
      const completion = await this.paymentsAccess.checkMonthCompletion(
        result.ruedaId,
        result.month,
        result.year,
      );

      if (completion?.allPaid && completion.groupId && completion.difference !== 0) {
        const isPositive = completion.difference > 0;
        await this.cashBoxManager.createMovement(
          new CreateCashMovementRequest(
            completion.groupId,
            isPositive ? 'in' : 'out',
            'automatic',
            isPositive ? 'rueda_collection' : 'rueda_disbursement',
            Math.abs(completion.difference),
            result.month,
            result.year,
            `Rueda ${completion.ruedaNumber} - ${result.month}/${result.year}`,
          ),
        );
      }
    }

    return this.mapToModel(result);
  }
}
