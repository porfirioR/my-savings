export class MemberReplacementAccessModel {
  constructor(
    public id: string,
    public groupId: string,
    public ruedaId: string,
    public slotPosition: number,
    public outgoingMemberId: string,
    public outgoingMonthlyAmount: number,
    public incomingMemberId: string,
    public incomingTotalAmount: number,
    public incomingInstallments: number,
    public status: 'active' | 'completed',
    public createdAt: string,
    public updatedAt: string,
    public ruedaNumber?: number,
    public outgoingMemberName?: string,
    public incomingMemberName?: string,
  ) {}
}
