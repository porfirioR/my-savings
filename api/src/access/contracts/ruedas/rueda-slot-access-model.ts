export class RuedaSlotAccessModel {
  constructor(
    public id: string,
    public ruedaId: string,
    public memberId: string,
    public position: number,
    public loanAmount: number,
    public installmentAmount: number,
    public totalToReturn: number,
    public loanMonth: number,
    public loanYear: number,
    public status: 'pending' | 'active' | 'completed',
    public createdAt: string,
    public updatedAt: string,
    public memberName?: string,
  ) {}
}
