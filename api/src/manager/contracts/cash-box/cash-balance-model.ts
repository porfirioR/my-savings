export class CashBalanceModel {
  constructor(
    public groupId: string,
    public totalIn: number,
    public totalOut: number,
    public balance: number,
  ) {}
}
