export class CreateRuedaSlotAccessRequest {
  constructor(
    public ruedaId: string,
    public memberId: string,
    public slotPosition: number,
    public loanAmount: number,
    public installmentAmount: number,
    public totalToReturn: number,
    public loanMonth: number,
    public loanYear: number,
    public status: 'pending' | 'active' | 'completed',
  ) {}
}
