import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PaymentAccessModel } from '../../access/contracts/payments';
import { PaymentsAccess, RuedasAccess } from '../../access/data/services';
import { GeneratePaymentsRequest, MarkPaymentRequest, PaymentModel } from '../contracts/payments';
import { CashBoxManager } from './cash-box-manager.service';
import { ContributionsManager } from './contributions-manager.service';
import { CreateCashMovementRequest } from '../contracts/cash-box';
import { toReferenceUuid } from '../../utility/helpers';

@Injectable()
export class PaymentsManager {
  constructor(
    private readonly paymentsAccess: PaymentsAccess,
    private readonly ruedasAccess: RuedasAccess,
    private readonly cashBoxManager: CashBoxManager,
    private readonly contributionsManager: ContributionsManager,
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

  private collectionReferenceId(ruedaId: string, month: number, year: number): string {
    return toReferenceUuid(`rueda:${ruedaId}:${month}/${year}`);
  }

  private disbursementReferenceId(ruedaId: string, month: number, year: number): string {
    return toReferenceUuid(`disburse:${ruedaId}:${month}/${year}`);
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
    // A month's list can only be generated once. To start over, the whole
    // month must be reverted first (resetMonth), which also cleans the caja.
    const existing = await this.paymentsAccess.countByRuedaAndMonth(req.ruedaId, req.month, req.year);
    if (existing.total > 0) throw new ConflictException('PAYMENTS_LIST_EXISTS');

    const result = await this.paymentsAccess.generateMonthlyPayments(req);
    await this.ensureDisbursement(req.ruedaId, req.month, req.year);
    return result.map((m) => this.mapToModel(m));
  }

  /**
   * Reverts a whole month: deletes every payment row (paid or not) and the
   * automatic caja movements tied to it (disbursement and, defensively,
   * collection). Only allowed while the month is not fully paid.
   */
  async resetMonth(ruedaId: string, month: number, year: number): Promise<void> {
    const rueda = await this.ruedasAccess.findById(ruedaId);
    await this.assertMonthHasPending(rueda.status, ruedaId, month, year);

    await this.paymentsAccess.deleteByRuedaAndMonth(ruedaId, month, year);
    await this.cashBoxManager.deleteByReferenceIds(rueda.groupId, [
      this.disbursementReferenceId(ruedaId, month, year),
      this.collectionReferenceId(ruedaId, month, year),
    ]);
  }

  /** Marks every still-pending payment of the month as paid and closes the month. */
  async markAllPaid(ruedaId: string, month: number, year: number): Promise<PaymentModel[]> {
    const rueda = await this.ruedasAccess.findById(ruedaId);
    await this.assertMonthHasPending(rueda.status, ruedaId, month, year);

    await this.paymentsAccess.markAllPendingPaid(ruedaId, month, year);
    await this.onPaymentsMarkedPaid(ruedaId, month, year);

    return this.findByRuedaAndMonth(ruedaId, month, year);
  }

  async markPayment(id: string, req: MarkPaymentRequest): Promise<PaymentModel> {
    const result = await this.paymentsAccess.markPayment(id, req);

    if (req.isPaid) {
      await this.onPaymentsMarkedPaid(result.ruedaId, result.month, result.year);
    } else {
      await this.onPaymentUnmarked(result.ruedaId, result.month, result.year);
    }

    return this.mapToModel(result);
  }

  /** Bulk month actions need an active rueda and a generated list with at least one pending payment. */
  private async assertMonthHasPending(
    ruedaStatus: string,
    ruedaId: string,
    month: number,
    year: number,
  ): Promise<void> {
    if (ruedaStatus !== 'active') throw new BadRequestException('RUEDA_NOT_ACTIVE');

    const counts = await this.paymentsAccess.countByRuedaAndMonth(ruedaId, month, year);
    if (counts.total === 0) throw new BadRequestException('PAYMENTS_LIST_NOT_FOUND');
    if (counts.paid === counts.total) throw new BadRequestException('MONTH_ALREADY_CLOSED');
  }

  /**
   * After one or more payments of a month are marked paid: if the month is now
   * fully paid, record the collection in caja (and make sure the disbursement
   * exists), then auto-complete the rueda if every month is fully paid.
   */
  private async onPaymentsMarkedPaid(ruedaId: string, month: number, year: number): Promise<void> {
    const completion = await this.paymentsAccess.checkMonthCompletion(ruedaId, month, year);

    if (completion?.allPaid && completion.groupId && completion.totalCollected > 0) {
      const referenceId = this.collectionReferenceId(ruedaId, month, year);
      const already = await this.cashBoxManager.existsByReference(completion.groupId, referenceId);
      if (!already) {
        await this.cashBoxManager.createMovement(
          new CreateCashMovementRequest(
            completion.groupId,
            'in',
            'automatic',
            'rueda_collection',
            completion.totalCollected,
            month,
            year,
            `Rueda ${completion.ruedaNumber} - Recaudación ${month}/${year}`,
            referenceId,
          ),
        );
      }

      // Safety net: ensure the disbursement exists for this month.
      // generateMonthlyPayments creates it, but if it was missed (silent error,
      // etc.) we guarantee it here when the month closes.
      await this.ensureDisbursement(ruedaId, month, year);
    }

    // Auto-complete the rueda if every month across all slots is fully paid
    const ruedaDone = await this.paymentsAccess.checkRuedaFullyPaid(ruedaId);
    if (ruedaDone) {
      await this.ruedasAccess.update(ruedaId, {
        status: 'completed',
        ...(ruedaDone.endMonth ? { endMonth: ruedaDone.endMonth, endYear: ruedaDone.endYear ?? undefined } : {}),
      });
      await this.contributionsManager.snapshotCompletedRueda(ruedaId);
    }
  }

  /** After a payment is unmarked: drop the month's collection and reopen the rueda if needed. */
  private async onPaymentUnmarked(ruedaId: string, month: number, year: number): Promise<void> {
    const completion = await this.paymentsAccess.checkMonthCompletion(ruedaId, month, year);

    if (completion?.groupId) {
      await this.cashBoxManager.deleteByReference(
        completion.groupId,
        this.collectionReferenceId(ruedaId, month, year),
      );
    }

    // If unmarking this payment un-completes an already-completed rueda,
    // revert its status and drop the stored contribution snapshot.
    const rueda = await this.ruedasAccess.findById(ruedaId);
    if (rueda.status === 'completed') {
      await this.ruedasAccess.update(ruedaId, { status: 'active' });
      await this.contributionsManager.clearRuedaContributions(ruedaId);
    }
  }

  private async ensureDisbursement(ruedaId: string, month: number, year: number): Promise<void> {
    const disbursement = await this.paymentsAccess.getDisbursementInfo(ruedaId, month, year);
    if (!disbursement) return;

    const referenceId = this.disbursementReferenceId(ruedaId, month, year);
    const already = await this.cashBoxManager.existsByReference(disbursement.groupId, referenceId);
    if (already) return;

    await this.cashBoxManager.createMovement(
      new CreateCashMovementRequest(
        disbursement.groupId,
        'out',
        'automatic',
        'rueda_disbursement',
        disbursement.loanAmount,
        month,
        year,
        `Rueda ${disbursement.ruedaNumber} - Desembolso ${month}/${year}`,
        referenceId,
      ),
    );
  }
}
