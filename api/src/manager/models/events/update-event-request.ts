import { CreateEventRequest } from "./create-event-request";

export class UpdateEventRequest implements Omit<CreateEventRequest, 'authorId'> {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public date: Date,
    public isPublic: boolean
  ) {
  }
}
