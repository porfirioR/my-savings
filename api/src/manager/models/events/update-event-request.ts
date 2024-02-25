import { CreateEventRequest } from "./create-event-request";

export class UpdateEventRequest extends CreateEventRequest {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public date: Date,
    public isPublic: boolean
  ) {
    super(name, null, description, date, isPublic)
  }
}
