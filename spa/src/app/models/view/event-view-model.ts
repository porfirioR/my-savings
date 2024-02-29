export class EventViewModel {
  constructor(
    public id: number,
    public name: string,
    public authorId: number,
    public authorEmail: string,
    public description: string,
    public isActive: boolean,
    public date: Date,
    public isPublic: boolean
  ) {}
}
