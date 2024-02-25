import { CreateUserRequest } from "./create-user-request";

export class UpdateUserRequest extends CreateUserRequest {
  constructor(
    public Id: number,
    public email: string,
    public DateCreated: Date
  ) {
    super(email)
  }
}
