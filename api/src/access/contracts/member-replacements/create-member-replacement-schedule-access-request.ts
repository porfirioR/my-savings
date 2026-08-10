export class CreateMemberReplacementScheduleAccessRequest {
  constructor(
    public replacementId: string,
    public month: number,
    public year: number,
    public installmentNumber: number,
    public outgoingAmount: number,
    public incomingAmount: number,
  ) {}
}
