import { CreateUserAccessRequest } from "./create-user-access-request";

export class UpdateUserAccessRequest extends CreateUserAccessRequest {
  constructor(
    public Id: number,
    public Email: string,
    public DateCreated: Date
  ) {
    super(Email)
  }
}
