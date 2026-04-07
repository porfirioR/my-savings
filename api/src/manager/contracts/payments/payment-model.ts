export class PaymentModel {
  constructor(
    public id: string,
    public ruedaId: string,
    public memberId: string,
    public memberName: string,
    public month: number,
    public year: number,
    public installmentAmount: number,
    public contributionAmount: number,
    public totalAmount: number,
    public installmentNumber: number,
    public paymentType: 'current_rueda' | 'previous_rueda' | 'contribution_only',
    public status: 'paid' | 'pending',
    public paidAt: string | null,
    public paymentSource: 'member' | 'cash_box' | null,
    public notes: string | null,
    public createdAt: string,
    public updatedAt: string,
  ) {}
}
