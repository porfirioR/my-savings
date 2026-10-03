import { Body, Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { GeneratePaymentsApiRequest, PaymentsMonthApiRequest } from '../contracts/payments';
import { MarkPaymentRequest, PaymentModel } from '../../manager/contracts/payments';
import { PaymentsManager } from '../../manager/services';

@Controller('groups/:groupId/ruedas/:ruedaId/payments')
export class PaymentsController {
  constructor(private readonly paymentsManager: PaymentsManager) {}

  @Get()
  async findByRuedaAndMonth(
    @Param('ruedaId') ruedaId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ): Promise<PaymentModel[]> {
    return this.paymentsManager.findByRuedaAndMonth(
      ruedaId,
      parseInt(month, 10),
      parseInt(year, 10),
    );
  }

  @Post('generate')
  async generateMonthlyPayments(
    @Param('ruedaId') ruedaId: string,
    @Body() body: GeneratePaymentsApiRequest,
  ): Promise<PaymentModel[]> {
    return this.paymentsManager.generateMonthlyPayments({ ...body, ruedaId });
  }

  @Post('reset')
  @HttpCode(204)
  async resetMonth(
    @Param('ruedaId') ruedaId: string,
    @Body() body: PaymentsMonthApiRequest,
  ): Promise<void> {
    return this.paymentsManager.resetMonth(ruedaId, body.month, body.year);
  }

  @Post('mark-all-paid')
  async markAllPaid(
    @Param('ruedaId') ruedaId: string,
    @Body() body: PaymentsMonthApiRequest,
  ): Promise<PaymentModel[]> {
    return this.paymentsManager.markAllPaid(ruedaId, body.month, body.year);
  }

  @Post(':id/mark-paid')
  async markPaid(@Param('id') id: string): Promise<PaymentModel> {
    return this.paymentsManager.markPayment(id, new MarkPaymentRequest(true));
  }

  @Post(':id/mark-unpaid')
  async markUnpaid(@Param('id') id: string): Promise<PaymentModel> {
    return this.paymentsManager.markPayment(id, new MarkPaymentRequest(false));
  }
}
