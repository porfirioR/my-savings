export class CreateMemberReplacementRequest {
  constructor(
    public groupId: string,
    public outgoingMemberId: string,
    public leftMonth: number,
    public leftYear: number,
    public accumulatedContributions: number,
    public remainingLoanBalance: number,
    public incomingFirstName: string,
    public incomingLastName: string,
    public outgoingMonthlyAmount: number,
    public incomingTotalAmount: number,
    public incomingInstallments: number,
    public incomingPhone?: string,
  ) {}
}
