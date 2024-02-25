export class CreateEventAccessRequest {
  constructor(
    public name: string,
    public authorId: number,
    public description: string,
    public date: Date,
    public isPublic: boolean
  ) {}
}