import { Injectable } from '@nestjs/common';
import { PaymentAccessService } from '../../access/services';
import { PaymentModel } from '../models/payments/payment-model';
import { PaymentAccessModel } from '../../access/contract/payments/payment-access-model';
import { CreatePaymentAccessRequest } from '../../access/contract/payments/create-payment-access-request';
import { CreatePaymentRequest } from '../models/payments/create-payment-request';

@Injectable()
export class PaymentManagerService {

  constructor(
    private readonly paymentAccessService: PaymentAccessService
  ) { }

  public getMyPayments = async (authorId: number, id: number): Promise<PaymentModel[]> => {
    const accessModelList = await this.paymentAccessService.getMyPayments(authorId, id);
    return accessModelList.map(this.mapAccessModelToModel)
  }

  public createPayment = async (request: CreatePaymentRequest): Promise<PaymentModel> => {
    const accessRequest = new CreatePaymentAccessRequest(
      request.date,
      request.savingId,
      request.amount,
      request.refund
    )
    const accessModel = await this.paymentAccessService.create(accessRequest);
    return this.mapAccessModelToModel(accessModel)
  }

  // public createPaymentFollow = async (request: PaymentFollowRequest): Promise<boolean> => {
  //   return await this.paymentFollowAccessService.createPaymentFollow(request)
  // }

  // public deletePaymentFollow = async (request: PaymentFollowRequest): Promise<boolean> => {
  //   return await this.paymentFollowAccessService.deletePaymentFollow(request)
  // }

  // public updatePayment = async (request: UpdatePaymentRequest): Promise<PaymentModel> => {
  //   const accessRequest = new UpdatePaymentAccessRequest(request.id, request.name, request.description, request.date, request.isPublic)
  //   const accessModel = await this.paymentAccessService.updatePayment(accessRequest);
  //   const exitPaymentFollow = await this.paymentFollowAccessService.checkExistPaymentFollows(new PaymentFollowRequest(accessModel.id, accessModel.authorId))
  //   if (exitPaymentFollow && !accessModel.isPublic) {
  //     await this.deletePaymentFollow(new PaymentFollowRequest(accessModel.id, accessModel.authorId))
  //   }
  //   if (!exitPaymentFollow && accessModel.isPublic) {
  //     await this.createPaymentFollow(new PaymentFollowRequest(accessModel.id, accessModel.authorId))
  //   }
  //   return this.mapAccessModelToModel(accessModel)
  // }

  private mapAccessModelToModel = (accessModel: PaymentAccessModel) => new PaymentModel(
    accessModel.id,
    accessModel.amount,
    accessModel.date,
    accessModel.refund,
    accessModel.savingId
  )
}
