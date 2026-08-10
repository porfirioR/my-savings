export class CreateMemberReplacementAccessRequest {
  constructor(
    public groupId: string,
    public ruedaId: string,
    public slotPosition: number,
    public outgoingMemberId: string,
    public outgoingMonthlyAmount: number,
    public incomingMemberId: string,
    public incomingTotalAmount: number,
    public incomingInstallments: number,
  ) {}
}
