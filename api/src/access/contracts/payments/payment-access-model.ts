export class PaymentAccessModel {
  constructor(
    public id: string,
    public ruedaId: string,
    public memberId: string,
    public memberName: string,
    public month: number,
    public year: number,
    public installmentAmountDue: number,
    public contributionAmountDue: number,
    public totalAmountDue: number,
    public installmentNumber: number,
    public paymentType: 'current_rueda' | 'previous_rueda' | 'contribution_only',
    public isPaid: boolean,
    public paidAt: string | null,
    public paymentSource: 'member' | 'cash_box' | null,
    public notes: string | null,
    public createdAt: string,
    public updatedAt: string,
  ) {}
}
