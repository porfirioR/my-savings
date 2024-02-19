import { CreateEventApiRequest } from "./create-event-api-request";

export interface UpdateEventApiRequest extends CreateEventApiRequest {
  id: number
}
