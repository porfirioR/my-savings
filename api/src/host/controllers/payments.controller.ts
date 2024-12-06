import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { PaymentModel } from '../models/payments/payment-model';
import { PaymentManagerService } from 'src/manager/services';
import { CreatePaymentRequest } from 'src/manager/models/payments/create-payment-request';
import { CreatePaymentApiRequest } from '../models/payments/create-payment-api-request';
import { PrivateEndpointGuard } from '../guards/private-endpoint.guard';
import { UpdatePaymentApiRequest } from '../models/payments/update-payment-api-request';
import { UpdatePaymentRequest } from 'src/manager/models/payments/update-payment-request';

@Controller()
@UseGuards(PrivateEndpointGuard)
export class PaymentController {
  constructor(private paymentManagerService: PaymentManagerService) {}

  @Get('my-events/:authorId/:id')
  async getMyPayments(@Param('authorId') authorId: number, @Param('id') id: number): Promise<PaymentModel[]> {
    return await this.paymentManagerService.getMyPayments(authorId, id);
  }

  @Post()
  async createPayment(@Body() apiRequest: CreatePaymentApiRequest): Promise<PaymentModel> {
    const request = new CreatePaymentRequest(apiRequest.date, apiRequest.savingId, apiRequest.amount, apiRequest.refund);
    return await this.paymentManagerService.createPayment(request);
  }

  @Put()
  async updatePayment(@Body() apiRequest: UpdatePaymentApiRequest): Promise<PaymentModel> {
    const request = new UpdatePaymentRequest(apiRequest.id, apiRequest.date, apiRequest.savingId, apiRequest.amount, apiRequest.refund)
    return await this.paymentManagerService.updatePayment(request);
  }
}
