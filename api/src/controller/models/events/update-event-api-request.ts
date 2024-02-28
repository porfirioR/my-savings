import { CreateEventApiRequest } from "./create-event-api-request";

export type UpdateEventApiRequest = Omit<CreateEventApiRequest, 'authorId'> & {
  id: number
}
