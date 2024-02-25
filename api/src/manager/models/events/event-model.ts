export class EventModel {
  constructor(
    public id: number,
    public name: string,
    public authorId: number,
    public description: string,
    public isActive: boolean,
    public date: Date,
    public isPublic: boolean
  ) {}
}
