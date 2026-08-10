export class MemberReplacementScheduleModel {
  constructor(
    public id: string,
    public replacementId: string,
    public month: number,
    public year: number,
    public installmentNumber: number,
    public outgoingAmount: number,
    public outgoingPaid: boolean,
    public outgoingPaidAt: string | null,
    public incomingAmount: number,
    public incomingPaid: boolean,
    public incomingPaidAt: string | null,
    public createdAt: string,
    public updatedAt: string,
  ) {}
}
