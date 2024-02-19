import { CreateUserAccessRequest } from "./create-user-access-request";

export class UpdateUserAccessRequest extends CreateUserAccessRequest {
  constructor(
    public Id: number,
    public email: string,
    public DateCreated: Date
  ) {
    super(email)
  }
}
