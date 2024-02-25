import { CreateEventAccessRequest } from "./create-event-access-request";

export class UpdateEventAccessRequest extends CreateEventAccessRequest {
  constructor(
    public id: number,
    public name: string,
    public authorId: number,
    public description: string,
    public date: Date,
    public isPublic: boolean
  ) {
    super(name, authorId, description, date, isPublic)
  }
}