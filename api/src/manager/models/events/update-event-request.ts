import { CreateEventRequest } from "./create-event-request";

export class UpdateEventRequest extends CreateEventRequest {
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
