import { CreateEventAccessRequest } from "./create-event-access-request";

export class UpdateEventAccessRequest extends CreateEventAccessRequest {
  constructor(
    public Id: number,
    public Name: string,
    public AuthorId: number,
    public Description: string,
    public Date: Date,
    public IsPublic: boolean
  ) {
    super(Name, AuthorId, Description, Date, IsPublic)
  }
}