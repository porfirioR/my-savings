import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
  GeneratePaymentsApiRequest,
  MarkPaymentApiRequest,
} from '../contracts/payments';
import { PaymentModel } from '../../manager/contracts/payments';
import { PaymentsManager } from '../../manager/services';

@Controller('ruedas/:ruedaId/payments')
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

  @Put(':id')
  async markPayment(
    @Param('id') id: string,
    @Body() body: MarkPaymentApiRequest,
  ): Promise<PaymentModel> {
    return this.paymentsManager.markPayment(id, body);
  }
}
