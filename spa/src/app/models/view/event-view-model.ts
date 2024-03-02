export class EventViewModel {
  public passDate: boolean
  constructor(
    public id: number,
    public name: string,
    public authorId: number,
    public authorEmail: string,
    public description: string,
    public isActive: boolean,
    public date: Date,
    public isPublic: boolean,
    public currentDate: Date
  ) {
    this.passDate = date.getTime() < currentDate.getTime()
  }
}
