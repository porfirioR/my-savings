export class Events {
  constructor(
    public Id: number,
    public Name: string,
    public AuthorId: number,
    public Description: string,
    public IsActive: boolean,
    public Date: Date,
    public IsPublic: boolean
  ) {}
}
