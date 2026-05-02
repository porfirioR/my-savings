import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ParallelLoansManager } from '../../manager/services';
import { CreateParallelLoanRequest, MarkLoanPaymentRequest, ParallelLoanModel, ParallelLoanPaymentModel, UpdateParallelLoanRequest } from '../../manager/contracts/parallel-loans';
import { CreateParallelLoanApiRequest, UpdateParallelLoanApiRequest } from '../contracts/parallel-loans';

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
    const request = new CreateParallelLoanRequest(groupId, body.memberId, body.amount, body.interestRate, body.totalInstallments, body.roundingUnit!, body.startMonth, body.startYear)
    return this.parallelLoansManager.create(request);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateParallelLoanApiRequest,
  ): Promise<ParallelLoanModel> {
    const request = new UpdateParallelLoanRequest(body.memberId, body.amount, body.interestRate, body.totalInstallments, body.roundingUnit!, body.startMonth, body.startYear);
    return this.parallelLoansManager.update(id, request);
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
