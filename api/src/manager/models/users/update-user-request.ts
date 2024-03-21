import { UserRequest } from "./user-request";

export class UpdateUserRequest extends UserRequest {
  constructor(
    public Id: number,
    public email: string,
    public DateCreated: Date
  ) {
    super(email)
  }
}
