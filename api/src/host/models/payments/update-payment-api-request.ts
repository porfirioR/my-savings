import { CreatePaymentApiRequest } from "./create-payment-api-request"

export type UpdatePaymentApiRequest = CreatePaymentApiRequest & {
  id: number
}
