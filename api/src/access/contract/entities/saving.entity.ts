export class SavingEntity {
  public id: number
  constructor(
    public name: string,
    public description: string,
    public isactive: boolean,
    public date: Date,
    public numberofpayment: number,
    public totalamount: number,
    public savingtypeid: number,
    public currencyid: number,
    public periodid: number,
    public userid: number
  ) {}
}
