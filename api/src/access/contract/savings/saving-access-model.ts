export class SavingAccessModel {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public isactive: boolean,
    public date: Date,
    public savingtypeid: number,
    public currencyid: number,
    public userid: number,
    public periodid?: number,
    public totalamount?: number,
    public numberofpayment?: number,
  ) { }
}
