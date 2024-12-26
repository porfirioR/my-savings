export class CreateSavingApiRequest {
  name: string
  description: string
  isActive: boolean
  date: Date
  savingTypeId: number
  currencyId: number
  userId: number
  periodId?: number
  totalAmount?: number
  numberOfPayment?: number
}
