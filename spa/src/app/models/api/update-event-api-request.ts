import { CreateEventApiRequest } from "."

export class UpdateEventApiRequest extends CreateEventApiRequest {
  constructor(
    public id: number,
    name: string,
    authorId: number,
    description: string,
    date: Date,
    isPublic: boolean
  ) {
    super(
      name,
      authorId,
      description,
      date,
      isPublic
    )
  }
}