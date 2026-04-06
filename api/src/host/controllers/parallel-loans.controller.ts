import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ParallelLoansManager } from '../../manager/services';
import { MarkLoanPaymentRequest, ParallelLoanModel, ParallelLoanPaymentModel } from '../../manager/contracts/parallel-loans';
import { CreateParallelLoanApiRequest } from '../contracts/parallel-loans';

@Controller('groups/:groupId/parallel-loans')
export class ParallelLoansController {
  constructor(private readonly parallelLoansManager: ParallelLoansManager) {}

  @Get()
  findByGroup(@Param('groupId') groupId: string): Promise<ParallelLoanModel[]> {
    return this.parallelLoansManager.findByGroup(groupId);
  }

  @Post()
  create(
    @Param('groupId') groupId: string,
    @Body() body: CreateParallelLoanApiRequest,
  ): Promise<ParallelLoanModel> {
    return this.parallelLoansManager.create({ ...body, groupId });
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<ParallelLoanModel> {
    return this.parallelLoansManager.findById(id);
  }

  @Get(':id/payments')
  getPayments(@Param('id') id: string): Promise<ParallelLoanPaymentModel[]> {
    return this.parallelLoansManager.getPayments(id);
  }

  @Post(':id/payments/:paymentId/mark-paid')
  markPayment(
    @Param('paymentId') paymentId: string,
  ): Promise<ParallelLoanPaymentModel> {
    return this.parallelLoansManager.markPayment(paymentId, new MarkLoanPaymentRequest(true));
  }
}
