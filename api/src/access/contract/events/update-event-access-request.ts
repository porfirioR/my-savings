import { CreateEventAccessRequest } from "./create-event-access-request";

export class UpdateEventAccessRequest extends CreateEventAccessRequest {
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