export class CreateEventAccessRequest {
  constructor(
    public Name: string,
    public AuthorId: number,
    public Description: string,
    public Date: Date,
    public IsPublic: boolean
  ) {}
}